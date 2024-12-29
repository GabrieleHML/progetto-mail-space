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