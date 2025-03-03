const jwt = require('jsonwebtoken');
const { cognito, CLIENT_ID, jwt_secret_key } = require('../config');


exports.signup = async (req, res) => {
  const { username, password, email } = req.body;
  const params = {
    ClientId: CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  };
  try {
    const data = await cognito.signUp(params).promise();
    console.log('Registrazione effettuata con successo!');
    res.json(data);
  } catch (error) {
    console.log('Registrazione NON effettuata');
    res.status(400).json(error);
  }
};

exports.confirm = async (req, res) => {
  const { username, confirmationCode } = req.body;
  const params = {
    ClientId: CLIENT_ID,
    Username: username,
    ConfirmationCode: confirmationCode,
  };
  try {
    const data = await cognito.confirmSignUp(params).promise();
    console.log('Registrazione confermata con successo!');
    res.json(data);
  } catch (error) {
    console.log('Errore, registrazione NON confermata!');
    res.status(400).json(error);
  }
};

exports.signin = async (req, res) => {
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
    const decodedToken = jwt.decode(idToken);
    const email = decodedToken.email;

    const authToken = data.AuthenticationResult.AccessToken;
    const token = jwt.sign({
        accessToken: authToken,
        username: username,
        email: email
      },
      jwt_secret_key, { expiresIn: '24h' }
    );
    res.json({ token });
    console.log('Accesso avvenuto con successo!');
  } catch (error) {
    console.error('Errore durante il login: ',error)
    res.status(400).json({ error: 'Accesso non riuscito' });
  }
};

exports.logout = async (req, res) => {

  const params = { AccessToken: req.user.accessToken };

  try {
    await cognito.globalSignOut(params).promise();
    console.log('Logout avvenuto con successo!');
    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.log('Errore durante il globalSignOut: ', error);
    res.status(400).json(error);
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
  };

  try {
    await cognito.forgotPassword(params).promise();
    console.log('Codice di reset inviato con successo!');
    res.json({ message: 'Codice di reset inviato con successo!' });
  } catch (error) {
    console.error('Errore durante l\'invio del codice di reset: ', error);
    res.status(400).json({ error: 'Errore durante l\'invio del codice di reset' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, confirmationCode, newPassword } = req.body;
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: confirmationCode,
    Password: newPassword,
  };

  try {
    await cognito.confirmForgotPassword(params).promise();
    console.log('Password reimpostata con successo!');
    res.json({ message: 'Password reimpostata con successo!' });
  } catch (error) {
    console.error('Errore durante la reimpostazione della password: ', error);
    res.status(400).json({ error: 'Errore durante la reimpostazione della password' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const params = {
    AccessToken: req.user.accessToken,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword
  };

  try {
    await cognito.changePassword(params).promise();
    console.log('Password modificata con successo!');
    res.json({ message: 'Password modificata con successo!' });
  } catch (error) {
    console.error('Errore durante la modifica della password: ', error);
    res.status(400).json({ error: 'Errore durante la modifica della password' });
  }
};
