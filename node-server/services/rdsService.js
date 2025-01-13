const { pool } = require('../config');

exports.insertEmail = async (emailData) => {
  const query = `
    INSERT INTO emails (
      user_email, 
      sender, 
      subject, 
      s3_key, 
      used_terms, 
      topic
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING s3_key
  `;
    
  const values = [
    emailData.userEmail,
    emailData.sender,
    emailData.subject,
    emailData.s3Key,
    emailData.usedTerms,
    emailData.topic
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0].s3_key;
  } catch (error) {
    console.error('Errore nel salvataggio dell\'email:', error);
    throw error;
  }
};

exports.deleteEmails = async (s3Keys) => {
  const query = `
    DELETE FROM emails
    WHERE s3_key = ANY($1::varchar[])
  `;

  try {
    await pool.query(query, [s3Keys]);
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

exports.addEmailsToFolder = async (s3Keys, folderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const emailFolderQuery = `
      INSERT INTO email_folders (email_s3_key, folder_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;

    for (const s3Key of s3Keys) {
      await client.query(emailFolderQuery, [s3Key, folderId]);
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
    JOIN email_folders ef ON e.s3_key = ef.email_s3_key
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

exports.removeEmailsFromFolder = async (s3Keys, folderId) => {
  const query = `
    DELETE FROM email_folders
    WHERE email_s3_key = ANY($1::varchar[]) AND folder_id = $2
  `;
  const values = [s3Keys, folderId];

  try {
    await pool.query(query, values);
    console.log('Le email sono state rimosse dalla cartella con successo!');
  } catch (error) {
    console.error('Errore nella rimozione delle email dalla cartella:', error);
    throw error;
  }
};
