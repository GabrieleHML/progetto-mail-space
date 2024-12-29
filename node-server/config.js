require('dotenv').config();
const AWS = require('aws-sdk');
const { Pool } = require('pg');
 
AWS.config.update({ region: 'eu-west-1' });

const cognito = new AWS.CognitoIdentityServiceProvider();
const s3 = new AWS.S3();
const comprehend = new AWS.Comprehend();

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
  s3,
  comprehend,
  CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  bucketName: process.env.S3_BUCKET_NAME,
  jwt_secret_key: process.env.JWT_SECRET,
  pool,
};
