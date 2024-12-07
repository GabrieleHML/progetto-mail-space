require('dotenv').config();
const AWS = require('aws-sdk');
const { Pool } = require('pg');

AWS.config.update({ region: 'eu-west-1' });

const cognito = new AWS.CognitoIdentityServiceProvider();
const s3 = new AWS.S3();
const comprehend = new AWS.Comprehend();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = {
  cognito,
  s3,
  comprehend,
  CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  bucketName: process.env.S3_BUCKET_NAME,
  jwt_secret_key: process.env.JWT_SECRET,
  pool,
};
