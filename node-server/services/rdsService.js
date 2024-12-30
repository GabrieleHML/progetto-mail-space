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
    console.error('Error saving email:', error);
    throw error;
  }
};

exports.getUserEmails = async (userEmail) => {
  console.log("Siamo entrati in rdsService.getUserEmails(); userEmail: ", userEmail); // TODO debug log
  const query = `
    SELECT *
    FROM emails
    WHERE user_email = $1
  `;

  try {
    const result = await pool.query(query, [userEmail]);
    console.log("Risultato query: ", result.rows); // TODO debug log
    return result.rows;
  } catch (error) {
    console.error('Error getting user emails:', error);
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
    console.error('Error searching by sender:', error);
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
    console.error('Error searching by used terms:', error);
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
    console.error('Error searching by topic:', error);
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
    console.error('Error searching by all:', error);
    throw error;
  }
};