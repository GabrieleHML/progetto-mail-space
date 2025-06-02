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
    if (mode) { // Intersezione (AND)
      query += ` AND labels @> $2::text[]`;
    } else { // Unione (OR)
      query += ` AND labels && $2::text[]`;
    }
    params.push(labels);
  }

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Errore nel filtraggio delle email (RDS):', error.message);
    console.error(error);
    throw error;
  }
};

exports.searchByAllInList = async (emailList, text) => {
  if (!text.trim()) return emailList;

  return emailList.filter(email => 
    email.sender.toLowerCase().includes(text.toLowerCase()) ||
    email.subject.toLowerCase().includes(text.toLowerCase()) ||
    email.body.toLowerCase().includes(text.toLowerCase())
  );
};

exports.searchAdvancedInList = async (emailList, sender, subject, words) => {
  let result = [...emailList];

  if (sender.trim()) {
    const senderLower = sender.toLowerCase();
    result = result.filter(email => email.sender.toLowerCase().includes(senderLower));
  }

  if (subject.trim()) {
    const subjectLower = subject.toLowerCase();
    result = result.filter(email => email.subject.toLowerCase().includes(subjectLower));
  }

  if (words.trim()) {
    const tokens = words.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
    result = result.filter(email => 
      tokens.some(token => email.body.toLowerCase().includes(token))
    );
  }

  return result;
};

exports.removeLabelsFromUserLabelsTable = async (userEmail, toBeRemoved) => {
  for (const tag of toBeRemoved) {
    console.log(`[rdsService] removeLabelsFromUserLabelsTable: rimuovo '${tag}' da user_labels per ${userEmail}`);
    const query = `
      UPDATE user_labels
      SET user_labels = array_remove(user_labels, $2)
      WHERE user_email = $1
        AND $2 = ANY(user_labels);
    `;
    await pool.query(query, [userEmail, tag]);
  }
};

exports.removeLabelsFromUserEmails = async (userEmail, toBeRemoved) => {
  for (const tag of toBeRemoved) {
    console.log(`[rdsService] removeLabelsFromUserEmails: rimuovo '${tag}' dalle email di ${userEmail}`);
    const query = `
      UPDATE emails
      SET labels = array_remove(labels, $2)
      WHERE user_email = $1 
        AND $2 = ANY(labels);
    `;
    await pool.query(query, [userEmail, tag]);
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

exports.addLabelsToUserLabelsTable = async (userEmail, toBeAdded) => {
  // 1) Recupero l’array corrente, per evitare duplicati “manuali”
  const selectQ = `SELECT user_labels FROM user_labels WHERE user_email = $1`;
  const result = await pool.query(selectQ, [userEmail]);
  if (result.rows.length === 0) {
    // Se non esiste ancora la riga (dovrebbe sempre esistere per ON CONFLICT DO NOTHING),
    // ma nel dubbio inserisco una riga vuota:
    console.log(`[rdsService] addLabelsToUserLabelsTable: Inserisco riga vuota per ${userEmail}`);
    const insertQ = `
      INSERT INTO user_labels (user_email, user_labels) 
      VALUES ($1, $2)
      ON CONFLICT (user_email) DO NOTHING;
    `;
    // Di default la tabella ha un array predefinito, ma noi lo costruiamo con i nuovi tag
    await pool.query(insertQ, [userEmail, toBeAdded]);
    return;
  }

  // 2) Calcolo l’unione con quelli già esistenti
  const existing = result.rows[0].user_labels || [];
  const merged = Array.from(new Set([...existing, ...toBeAdded]));

  // 3) Update del record con l’array unito
  console.log(`[rdsService] addLabelsToUserLabelsTable: aggiorno user_labels di ${userEmail} con ${merged}`);
  const updateQ = `
    UPDATE user_labels
    SET user_labels = $2::text[]
    WHERE user_email = $1;
  `;
  await pool.query(updateQ, [userEmail, merged]);
};

exports.addLabelsToEmail = async (emailId, tagsToAdd) => {
  console.log(`[rdsService] addLabelsToEmail: email id=${emailId}, aggiungo ${tagsToAdd}`);
  const query = `
    UPDATE emails
    SET labels = (
      SELECT array_agg(DISTINCT elem)
      FROM unnest(labels || $2::text[]) AS elem
    )
    WHERE id = $1;
  `;
  const result = await pool.query(query, [emailId, tagsToAdd]);
  console.log(`[rdsService] addLabelsToEmail: Modificate ${result.rowCount} righe per email id=${emailId}.`);
};
