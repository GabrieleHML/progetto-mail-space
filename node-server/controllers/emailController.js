const rdsService = require('../services/rdsService');
const fs = require('fs');
const emlParser = require('eml-parser');

const processEmail = async (sender, subject, body, userEmail, res) => {
  
  // TODO 1. Associo le labels alla mail con API di AI
  const labels = [];
  // 2. Salvo i dati nel database RDS
  try {
    const emailData = {
      userEmail,
      sender,
      subject,
      body,
      labels
    };
    await rdsService.insertEmail(emailData);
    res.json({ labels });
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

// Metodo di eliminazione che riceve le chiavi delle email da eliminare
exports.deleteEmails = async (req, res) => {
  try {
    const emailIds = req.body.emailIds;
    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ message: 'Array emailIds invalido o vuoto' });
    }
    await rdsService.deleteEmails(emailIds);
    res.json({ message: 'Email eliminate con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore nell eliminazione delle email', error });
  }
};

// Funzione di utilità che serve ad estrarre un indirizzo email valido da una stringa di input
const cleanSenderEmail = (inputString) => {
  // Cerca un indirizzo email racchiuso tra i simboli < e >
  const regex1 = /<([^>]+)>/;

  // Se fallisce regex1 allora regex2 cerca un indirizzo email valido ovunque nella stringa
  const regex2 = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

  const match1 = inputString.match(regex1);
  if (match1) {
    return match1[1].trim(); 
  }

  const match2 = inputString.match(regex2);
  return match2 ? match2[0].trim() : null;
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
    const sender = req.body.sender || '';
    const subject = req.body.subject || '';
    const words = req.body.words || '';
    const freeText = req.body.freeText || '';

    let emails_RDS = [];

    switch (option) {
      case 0: // Tutte le email
        emails_RDS = await rdsService.getUserEmails(userEmail);
        break;
      case 1: // Ricerca semplice in sender, subject, body
        emails_RDS = await rdsService.searchByAll(userEmail, freeText);
        break;
      case 2: // Ricerca avanzata con campi opzionali
        emails_RDS = await rdsService.searchAdvanced(userEmail, sender, subject, words);
        break;
      default:
        return res.status(400).json({ message: 'Opzione non valida' });
    }

    res.json(emails_RDS);
  } catch (error) {
    res.status(500).json({ message: 'Errore nella ricerca delle email', error });
  }
};