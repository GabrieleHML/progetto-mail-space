const { s3, bucketName } = require('../config');

exports.uploadEmail = async (userEmail, body) => {
  const s3Key = `${userEmail}/${Date.now()}.txt`;
  const params = {
    Bucket: bucketName,
    Key: s3Key,
    Body: body,
  };
  console.log(params); // TODO log
  const data = await s3.upload(params).promise();
  return data.Key;
};

exports.getEmailContent = async (s3Key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: s3Key,
    };
    const data = await s3.getObject(params).promise();
    return data.Body.toString();
  } catch (error) {
    console.error(`Errore nella ricerca dell'email per chiave S3: ${s3Key};`, error);
    throw error;
  }
};
