const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-west-1' });

const cognito = new AWS.CognitoIdentityServiceProvider();
const s3 = new AWS.S3();
const comprehend = new AWS.Comprehend();

const CLIENT_ID = '4jaupllfc0a8f7tjdasineu6bm';
const bucketName = 'project-cloud-00';
const jwt_secret_key = '05747ea80a1706195b1132a16fe8aabf58d5c12f48596f96c65fce67edf272de';

module.exports = {
  cognito,
  s3,
  comprehend,
  CLIENT_ID,
  bucketName,
  jwt_secret_key,
};
