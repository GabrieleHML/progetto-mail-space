require('dotenv').config();
const AWS = require('aws-sdk');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
 
AWS.config.update({ region: 'eu-west-1' });

const cognito = new AWS.CognitoIdentityServiceProvider();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const pool = new Pool({
  ssl: {
    rejectUnauthorized: false
  },
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME,
  database: process.env.RDS_DB_NAME,
  password: process.env.RDS_PASSWORD,
  port: parseInt(process.env.RDS_PORT || '5432'),
});

module.exports = {
  cognito,
  CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  jwt_secret_key: process.env.JWT_SECRET,
  pool,
  genAI,
};
