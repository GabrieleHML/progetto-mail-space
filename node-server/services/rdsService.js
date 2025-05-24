const { pool } = require('../config');

exports.insertEmail = async (emailData) => {
  const query = `
    INSERT INTO emails (
      user_email, 
      sender, 
      subject, 
      body,
      labels
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
    
  const values = [
    emailData.userEmail,
    emailData.sender,
    emailData.subject,
    emailData.body,
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

exports.searchByAll = async (userEmail, text) => {
  const query = `
    SELECT * FROM emails
    WHERE user_email = $1
      AND (
        sender ILIKE '%' || $2 || '%'
        OR subject ILIKE '%' || $2 || '%'
        OR body ILIKE '%' || $2 || '%'
      )
  `;

  try {
    const { rows } = await pool.query(query, [userEmail, text]);
    return rows;
  } catch (error) {
    console.error('Errore nella ricerca libera:', error);
    throw error;
  }
};

exports.searchAdvanced = async (userEmail, sender, subject, words) => {
  const conditions = ['user_email = $1'];
  const values = [userEmail];
  let paramIndex = 2;

  // Costruzione dinamica dei filtri
  if (sender.trim()) {
    conditions.push(`sender ILIKE '%' || $${paramIndex} || '%'`);
    values.push(sender);
    paramIndex++;
  }

  if (subject.trim()) {
    conditions.push(`subject ILIKE '%' || $${paramIndex} || '%'`);
    values.push(subject);
    paramIndex++;
  }

  if (words.trim()) {
    const tokens = words.split(',').map(w => w.trim()).filter(Boolean);
    for (const token of tokens) {
      conditions.push(`body ILIKE '%' || $${paramIndex} || '%'`);
      values.push(token);
      paramIndex++;
    }
  }

  const query = `
    SELECT * FROM emails
    WHERE ${conditions.join(' AND ')}
  `;

  try {
    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error('Errore nella ricerca avanzata:', error);
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

exports.getFilteredEmails = async (userEmail, mode, labels) => {
  let query = `
    SELECT * FROM emails
    WHERE user_email = $1
  `;
  const params = [userEmail];

  if (Array.isArray(labels) && labels.length > 0) {
    if (labels.length > 1) {
      if (mode) {
        query += ` AND labels @> $2::text[]`;
      } else {
        query += ` AND labels && $2::text[]`;
      }
    } else {
      query += ` AND labels && $2::text[]`;
    }
    params.push(labels);
  }

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Errore nel filtraggio delle email (RDS):', error.message);
    // Se vuoi vedere l’intero “stack” o dettaglio dell’errore PG:
    console.error(error);
    throw error;
  }
};

exports.removeLabelsFromUserEmails = async (userEmail, toBeRemoved) => {
  for (const label of toBeRemoved) {
    const query = `
      UPDATE emails
      SET labels = array_remove(labels, $2)
      WHERE user_email = $1
        AND $2 = ANY(labels);
    `;
    await pool.query(query, [userEmail, label]);
  }
  
};

exports.getDistinctUserLabels = async (userEmail) => {
  const query = `
    SELECT DISTINCT unnest(labels) AS label 
    FROM emails 
    WHERE user_email = $1
  `;
  
  try {
    const result = await pool.query(query, [userEmail]);
    return result.rows.map(r => r.label);
  } catch (error) {
    console.error('Errore nel filtraggio delle email (getDistinctUserLabels - RDS):', error.message);
    console.error(error);
    throw error;
  }
};

exports.addLabelsToEmail = async (emailId, tagsToAdd) => {
  console.log(`[rdsService.addLabelsToEmail] Sto aggiornando email id=${emailId} con tags:`, tagsToAdd);
  const query = `
    UPDATE emails
    SET labels = (
      SELECT array_agg(DISTINCT elem)
      FROM unnest(labels || $2::text[]) AS elem
    )
    WHERE id = $1;
  `;
  const result = await pool.query(query, [emailId, tagsToAdd]);
  console.log(`[rdsService.addLabelsToEmail] Modificate ${result.rowCount} righe per email id=${emailId}.`);
};
