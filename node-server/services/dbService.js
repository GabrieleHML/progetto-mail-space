const { pool } = require('../config');

exports.insertEmail = async (emailData) => {
    const { userEmail, sender, subject, s3Key, usedTerms, topic } = emailData;

    // Validazione dei dati in ingresso
    if (!userEmail || !sender || !subject || !s3Key || !usedTerms || !topic) {
      throw new Error('Dati mancanti nel payload email.');
    }    

    const query = `
    INSERT INTO emails (user_email, sender, subject, s3_key, used_terms, topic)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (s3_key) DO UPDATE SET
      user_email = EXCLUDED.user_email,  
      sender = EXCLUDED.sender,
      subject = EXCLUDED.subject,
      used_terms = EXCLUDED.used_terms,
      topic = EXCLUDED.topic;
  `;

  const values = [userEmail, sender, subject, s3Key, usedTerms, topic];

  try {
    await pool.query(query, values);
    console.log('Email salvata correttamente nel database.');
  } catch (error) {
    console.error('Errore durante il salvataggio dell\'email:', error);  
    throw new Error('Errore durante l\'operazione di salvataggio sul database');
  }
};