const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { query } = require('./database');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const imaps = require('imap-simple');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// AWS.config.update({ region: 'eu-north-1' }); // Stoccolma
AWS.config.update({ region: 'eu-west-1' });

// CONFIGURAZIONE COGNITO
const cognito = new AWS.CognitoIdentityServiceProvider();
const CLIENT_ID = '4jaupllfc0a8f7tjdasineu6bm';
const jwt_secret_key = '05747ea80a1706195b1132a16fe8aabf58d5c12f48596f96c65fce67edf272de';

// CONFIGURAZIONE S3
const s3 = new AWS.S3(); 
const bucketName = 'project-cloud-00';

// CONFIGURAZIONE COMPREHEND 
const comprehend = new AWS.Comprehend();


const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, jwt_secret_key, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;  // Contiene i dati dell'utente
            next();
        });
    } else {
        req.sendStatus(401);
    }
};

// METODO PER EFFETTUARE LA REGISTRAZIONE
app.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    const params = {
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: [
            {
                Name: 'email',
                Value: email,
            },
        ],
    };

    try {
        const data = await cognito.signUp(params).promise();
        console.log('Registrazione effettuata con successo!');
        res.json(data);
    } catch (err) {
        console.log('Registrazione NON effettuata!', err);
        res.status(400).json(err);
    }
});

// METODO PER EFFETTUARE LA CONFERMA DELLA REGISTRAZIONE
app.post('/confirm', async (req, res) => {
    const { username, confirmationCode } = req.body;

    const params = {
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: confirmationCode,
    };

    try {
        const data = await cognito.confirmSignUp(params).promise();
        console.log('Conferma registrazione effettuata con successo!');
        res.json(data);
    } catch (err) {
        console.log('Conferma registrazione NON effettuata!', err);
        res.status(400).json(err);
    }
});

// METODO PER EFFETTUARE L'ACCESSO, RESTITUISCE IL TOKEN 
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };

    try {
        const data = await cognito.initiateAuth(params).promise();

        const idToken = data.AuthenticationResult.IdToken;
        const decodedToken = jwt.decode(idToken);  // Decodifica il token JWT per estrarre i dati
        const email = decodedToken.email;  // Estrai l'email dal token decodificato

        const authToken = data.AuthenticationResult.AccessToken;
        const token = jwt.sign({ 
                accessToken: authToken,
                username: username,
                email: email
            }, 
            jwt_secret_key, 
            { expiresIn: '24h' }
        );
        console.log('Token Object: ',token);
        res.json({ token });
        console.log("Accesso avvenuto con successo!");
    } catch (err) {
        res.status(400).json(err);
        console.log("Accesso NON avvenuto!");
    }
});

app.get('/demoPage', authenticateJWT, (req, res) => {
    res.json({ message: 'Hai effettuato l\'accesso! Benvenuto nell\'area protetta' });
});

// METODO PER EFFETTUARE IL LOGOUT
app.post('/logout', authenticateJWT, async (req, res) => {
    const token = req.user.accessToken;

    console.log('EMAIL: ', req.user.email); // FIXME debug log

    const params = {
        AccessToken: token,
    };

    try {
        await cognito.globalSignOut(params).promise();
        console.log('Logout avvenuto con successo!');
        res.json({ message: 'Successfully logged out' });
    } catch (err) {
        console.log('Errore durante il globalSignOut: ', err);
        res.status(400).json(err);
    }
});

// Metodo per il caricamento della mail in S3
const uploadToS3 = async (userEmail, emailText) => {
    // Imposto i parametri di upload per S3
    const s3Key = `${userEmail}/${Date.now()}.txt`; 
    console.log('Sono entrato nel metodo uploadToS3');
    const uploadparams = {
        Bucket: bucketName,
        Key: s3Key,
        Body: emailText
    };

    try {
        // Eseguo l'upload su S3
        const data = await s3.upload(uploadparams).promise();
        console.log('Caricamento su S3 riuscito: ',data.Location);
        console.log('s3Key: ',data.Key);
        return data.Key;
    } catch (error) {
        console.log('Errore durante il caricamento su S3: ', error);
        throw error;
    }
};

// Metodo per l'estrazione dei termini più usati e argomento della mail
const analyzeTextWithComprehend = async (text) => {
    const comprehendParams = {
        Text: text,
        LanguageCode: 'it'
    };

    try {
        // Rileva le entità
        const comprehendData = await comprehend.detectEntities(comprehendParams).promise();
        console.log('Rilevamento entità riuscito:', comprehendData);

        const termineCounts = {};
        comprehendData.Entities.forEach(entity => {
            const termine = entity.Text.toLowerCase();
            termineCounts[termine] = (termineCounts[termine] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(termineCounts));
        const terminiUsati = Object.keys(termineCounts).filter(termine => termineCounts[termine] === maxCount);

        // Rileva le frasi chiave
        const comprehendKeyPhrases = await comprehend.detectKeyPhrases(comprehendParams).promise();
        console.log('Rilevamento frasi chiave riuscito:', comprehendKeyPhrases);

        const argomento = comprehendKeyPhrases.KeyPhrases[0] ? comprehendKeyPhrases.KeyPhrases[0].Text : 'N/A';

        return { terminiUsati, argomento };
    } catch (error) {
        console.error('Errore durante l\'analisi del testo con Comprehend:', error);
        throw error;  // Rilancia l'errore per permettere la gestione a un livello superiore
    }
};


// Metodo per il salvataggio dei metadati nel DB di RDS
const saveMetadataToRDS = async (userEmail, s3Key, sender, terminiUsati, argomento) => {
    const sql = `
        INSERT INTO emails (user_email, s3_key, mittente, termini_usati, argomento)
        VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [userEmail, s3Key, sender, terminiUsati, argomento];

    try {
        await query(sql, values);
        console.log('Salvataggio dei metadati nel database RDS riuscito:', values);
    } catch (error) {
        console.error('Errore durante il salvataggio dei metadati nel database RDS:', error);
        throw error;  // Rilancia l'errore per permettere la gestione a un livello superiore
    }
};


// METODO PER IL CARICAMENTO ED ESTRAZIONE DATI DELLA MAIL, CON GESTIONE DI RDS
app.post('/upload', authenticateJWT, async (req, res) => {
    const { mittente, oggetto, testo } = req.body;
    const userEmail = req.user.email;
    console.log('Sono entrato nel metodo POST');
    try {
        // Carica l'email su S3 e ottieni la chiave dell'oggetto
        // const s3Key = await uploadToS3(userEmail, testo); TODO

        // Analizza il testo con Comprehend
        const { terminiUsati, argomento } = await analyzeTextWithComprehend(testo);

        // TODO RDS
        // Salva i metadati nel database RDS
        // await saveMetadataToRDS(userEmail, s3Key, mittente, terminiUsati, argomento);

        // Log per debug
        console.log('Chiave elemento caricato in S3:', s3Key);
        console.log('Termini usati:', terminiUsati);
        console.log('Argomento:', argomento);
        
        console.log('Metodo /upload-email eseguito con successo!')
        // res.json({ message: 'Email caricata e salvata con successo!', s3Key, terminiUsati, argomento });
        res.json({ message: 'Bella zio!'});
    } catch (err) {
        console.error('Errore durante il caricamento dell\'email: ', err);
        res.status(500).json({ message: 'Error uploading email' });
    }
});

// METODO PER IL RECUPERO DI TUTTE LE MAIL CHE HA CARICATO L'UTENTE AUTENTICATO 
app.get('/user-emails', authenticateJWT, async (req, res) => {
    const userEmailKey = `${req.user.email}/`;
    const params = {
        Bucket: bucketName,
        Prefix: userEmailKey
    }

    s3.listObjectsV2(params, (err, data) => {
        if (err) {
            console.error('Errore durante il recupero delle email dell\'utente: ', err);
            return res.status(500).json({ message: 'Errore interno del server' });
        }

        const emails = data.Contents.map(item => {
            return {
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified
            };
        });
        res.json(emails);
    });
});


// METODO PER LA RICERCA 
// TODO 


// --- DEVONO STARE ALLA FINE ---
app.use((req, res) => {
    res.status(404).json({ message: 'Page not found' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});