const s3Service = require('../services/s3Service');
const comprehendService = require('../services/comprehendService');
const dbService = require('../services/dbService');
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
    console.log("EmailData: ", emailData);
    await dbService.insertEmail(emailData);
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
      await processEmail(mittente, oggetto, testo, userEmail, res);

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

exports.getUserEmails = async (req, res) => {
  try {
    const emails = await s3Service.getUserEmails(req.user.email);
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella ricerca delle mail', error });
  }
};
