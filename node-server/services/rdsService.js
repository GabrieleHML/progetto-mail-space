const { pool } = require('../config');

exports.insertEmail = async (emailData) => {
  const query = `
    INSERT INTO emails (
      user_email, 
      sender, 
      subject, 
      body, 
      used_terms, 
      labels
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
    
  const values = [
    emailData.userEmail,
    emailData.sender,
    emailData.subject,
    emailData.body,
    emailData.usedTerms,
    emailData.labels
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Errore nel salvataggio dell\'email:', error);
    throw error;
  }
};

exports.deleteEmails = async (emailIds) => {
  const query = `
    DELETE FROM emails
    WHERE id = ANY($1::int[])
  `;

  try {
    await pool.query(query, [emailIds]);
    console.log('Le email selezionate sono state eliminate con successo!');
  } catch (error) {
    console.error('Errore nell\'eliminazione delle email selezionate:', error);
    throw error;
  }
};

exports.getUserEmails = async (userEmail) => {
  const query = `
    SELECT *
    FROM emails
    WHERE user_email = $1
  `;

  try {
    const result = await pool.query(query, [userEmail]);
    return result.rows;
  } catch (error) {
    console.error('Errore nel recupero delle email dell\'utente:', error);
    throw error;
  }
};

exports.searchBySender = async (userEmail, sender) => {
  const query = `
    SELECT *
    FROM emails
    WHERE user_email = $1
    AND sender ILIKE $2
  `;

  try {
    const result = await pool.query(query, [userEmail, `%${sender}%`]);
    return result.rows;
  } catch (error) {
    console.error('Errore nella ricerca per mittente:', error);
    throw error;
  }
};

exports.searchByUsedTerms = async (userEmail, usedTerms) => {
  const query = `
    SELECT *
    FROM emails
    WHERE user_email = $1
    AND EXISTS (
      SELECT 1
      FROM unnest(used_terms) AS term
      WHERE term ILIKE $2
    )
  `;

  try {
    const result = await pool.query(query, [userEmail, `%${usedTerms}%`]);
    return result.rows;
  } catch (error) {
    console.error('Errore nella ricerca per termini utilizzati:', error);
    throw error;
  }
};

exports.searchByTopic = async (userEmail, topic) => {
  const query = `
    SELECT *
    FROM emails
    WHERE user_email = $1
    AND topic ILIKE $2
  `;

  try {
    const result = await pool.query(query, [userEmail, `%${topic}%`]);
    return result.rows;
  } catch (error) {
    console.error('Errore nella ricerca per argomento:', error);
    throw error;
  }
};

exports.searchByAll = async (userEmail, word) => {
  const query = `
    SELECT *
    FROM emails
    WHERE user_email = $1
    AND (
      sender ILIKE $2
      OR subject ILIKE $2
      OR EXISTS (
        SELECT 1
        FROM unnest(used_terms) AS term
        WHERE term ILIKE $2
      )
      OR topic ILIKE $2
    )
  `;

  try {
    const result = await pool.query(query, [userEmail, `%${word}%`]);
    return result.rows;
  } catch (error) {
    console.error('Errore nella ricerca globale:', error);
    throw error;
  }
};

exports.addFolder = async (userEmail, folderName) => {
  const query = `
    INSERT INTO folders (user_email, name)
    VALUES ($1, $2)
    RETURNING id
  `;
  const values = [userEmail, folderName];

  try {
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Errore nell\'aggiunta della cartella:', error);
    throw error;
  }
};

exports.getFolders = async (userEmail) => {
  const query = `
    SELECT id, name
    FROM folders
    WHERE user_email = $1
  `;
  try {
    const result = await pool.query(query, [userEmail]);
    return result.rows;
  } catch (error) {
    console.error('Errore nel recupero delle cartelle:', error);
    throw error;
  }
};

exports.deleteFolder = async (folderId) => {
  const query = `
    DELETE FROM folders
    WHERE id = $1
  `;
  const values = [folderId];

  try {
    await pool.query(query, values);
    console.log('La cartella è stata eliminata con successo!');
  } catch (error) {
    console.error('Errore nell\'eliminazione della cartella:', error);
    throw error;
  }
};

exports.addEmailsToFolder = async (emailIds, folderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const emailFolderQuery = `
      INSERT INTO email_folders (email_id, folder_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;

    for (const emailId of emailIds) {
      await client.query(emailFolderQuery, [emailId, folderId]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore nell\'aggiunta delle email alla cartella:', error);
    throw error;
  } finally {
    client.release();
  }
};

exports.getEmailsFromFolder = async (folderId) => {
  const query = `
    SELECT e.*
    FROM emails e
    JOIN email_folders ef ON e.id = ef.email_id
    WHERE ef.folder_id = $1
  `;
  const values = [folderId];

  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Errore nel recupero delle email dalla cartella:', error);
    throw error;
  }
};

exports.removeEmailsFromFolder = async (emailIds, folderId) => {
  const query = `
    DELETE FROM email_folders
    WHERE email_id = ANY($1::int[]) AND folder_id = $2
  `;
  const values = [emailIds, folderId];

  try {
    await pool.query(query, values);
    console.log('Le email sono state rimosse dalla cartella con successo!');
  } catch (error) {
    console.error('Errore nella rimozione delle email dalla cartella:', error);
    throw error;
  }
};

exports.getLabels = async (userEmail) => {
  const insertQuery = `
    INSERT INTO user_labels (user_email)
    VALUES ($1)
    ON CONFLICT (user_email) DO NOTHING
  `;
  const selectQuery = `
    SELECT user_labels
    FROM user_labels
    WHERE user_email = $1
  `;
  
  try {
    await pool.query(insertQuery, [userEmail]);
    const result = await pool.query(selectQuery, [userEmail]);
    return result.rows[0].user_labels || [];
  } catch (error) {
    console.error('Errore nel recupero delle etichette:', error);
    throw error;
  }
};

exports.updateLabels = async (userEmail, labels) => {
  const query = `
    UPDATE user_labels 
    SET user_labels = $2 
    WHERE user_email = $1
  `;

  const values = [userEmail, labels];

  try {
    await pool.query(query, values);
    console.log('Le etichette sono state aggiornate con successo!');
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle etichette:', error);
    throw error;
  }
};