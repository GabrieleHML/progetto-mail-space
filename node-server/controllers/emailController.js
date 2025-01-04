const s3Service = require('../services/s3Service');
const comprehendService = require('../services/comprehendService');
const rdsService = require('../services/rdsService');
const EmlParser = require('eml-parser');
const fs = require('fs');
const emlParser = require('eml-parser');

const processEmail = async (sender, subject, body, userEmail, res) => {
  let s3Key, usedTerms, topic;
  
  console.log("Body che arriva a processEmail: ",body);

  try {
    // 1. Carica il contenuto su S3
    s3Key = await s3Service.uploadEmail(userEmail, body);
    console.log("OK: Caricamento S3");
  } catch (error) {
    console.error('Errore durante il caricamento su S3');
    return res.status(500).json({ message: 'Errore nel caricamento su S3', error });
  }

  try {
    // 2. Analizza il testo con Amazon Comprehend
    const analysisResult = await comprehendService.analyzeText(body);
    usedTerms = analysisResult.usedTerms;
    topic = analysisResult.topic;
    console.log("Argomento: ", topic);
    console.log("Termini usati: ", usedTerms);
    console.log("OK: Analisi Comprehend");
  } catch (error) {
    console.error('Errore durante l\'analisi del testo con Amazon Comprehend');
    return res.status(500).json({ message: 'Errore nell\'analisi del testo', error });
  }

  try {
    // 3. Salvataggio nel database RDS
    const emailData = {
      userEmail,
      sender,
      subject,
      s3Key,
      usedTerms,
      topic,
    };
    await rdsService.insertEmail(emailData);
    console.log("OK: Caricamento RDS");
    res.json({ s3Key, usedTerms, topic });
  } catch (error) {
    console.error('Errore durante il salvataggio nel database RDS');
    res.status(500).json({ message: 'Errore nel salvataggio nel database', error });
  }
};

// Metodo di upload che riceve i dati dal form di mail-form.component
exports.uploadEmail = async (req, res) => {
  try {
    const sender = req.body.sender;
    const subject = req.body.subject;
    const body = req.body.body;
    const userEmail = req.user.email;

    await processEmail(sender, subject, body, userEmail, res);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel caricamento della mail', error });
  }
};

// Estrae l'email da una stringa del tipo '[ "Nome Cognome" <esempio.esempio123@gmail.com> ]' ottenuta dal file .eml
/*
const extractEmail = (inputString) => {
  const regex = /<([^>]+)>/;
  const match = inputString.match(regex);
  return match ? match[1].trim() : null;
}
*/
const cleanSenderEmail = (inputString) => {
  const regex1 = /<([^>]+)>/;
  const regex2 = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

  // Primo tentativo con regex1
  const match1 = inputString.match(regex1);
  if (match1) {
    return match1[1].trim(); // Restituisce il contenuto tra <>
  }

  // Se regex1 non ha successo, tenta con regex2
  const match2 = inputString.match(regex2);
  return match2 ? match2[0].trim() : null; // Restituisce l'email trovata o null se nessuna email è presente
};

// Metodo di upload che riceve il file da cui estrae le informazioni utili
exports.uploadEmailFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nessun file caricato.' });
    }

    const filePath = req.file.path;
    const userEmail = req.user.email;

    // Legge il file e lo processa con eml-parser
    const stream = fs.createReadStream(filePath);
    const eml = new emlParser(stream);

    eml.parseEml()
    .then(async (parsedEmail) => {
      const mittente = parsedEmail.from.text || 'Mittente sconosciuto';
      const oggetto = parsedEmail.subject || 'Oggetto non presente';
      const testo = parsedEmail.text || 'Testo non presente';

      // Invia le informazioni estratte a processEmail
      await processEmail(cleanSenderEmail(mittente), oggetto, testo, userEmail, res);
      
      // Cancella il file temporaneo
      fs.unlinkSync(filePath);
    })
    .catch((error) =>{
      fs.unlinkSync(filePath);
      res.status(500).json({ message: 'Errore durante il parsing del file .eml', error });
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore nel caricamento del file', error });
  }
};

exports.getUserEmailsOrSearchBy = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const option = req.body.option;
    const word = req.body.word || ''; // Parola da cercare, nulla se l'opzione è 0

    // Lista di email da inviare al Client
    const emails_CLIENT = [];
    
    // Lista di email da RDS
    let emails_RDS = [];

    switch (option) {
      case 0: // Tutte le email
        emails_RDS = await rdsService.getUserEmails(userEmail);
        break;
      case 1: // Cerca per tutte mittente, argomento e termini usati
        emails_RDS = await rdsService.searchByAll(userEmail, word);
        break;
      case 2: // Cerca per mittente
        emails_RDS = await rdsService.searchBySender(userEmail, word);
        break;
      case 3: // Cerca per argomento
        emails_RDS = await rdsService.searchByTopic(userEmail, word);
        break;
      case 4: // Cerca per termini usati
        emails_RDS = await rdsService.searchByUsedTerms(userEmail, word);
        break;
      default: 
        res.status(400).json({ message: 'Opzione non valida' });
    }

    // Per ogni email, ottengo il body da S3 e lo aggiungo alla lista da inviare al Client
    for (const email of emails_RDS) {
      const body = await s3Service.getEmailContent(email.s3_key);
      emails_CLIENT.push({
        sender: email.sender,
        subject: email.subject,
        body: body
      });
    }
    console.log("le email: ", emails_CLIENT);
    res.json(emails_CLIENT);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella ricerca delle mail', error });
  }
};
