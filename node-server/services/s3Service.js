const { s3, bucketName } = require('../config');

exports.uploadEmail = async (userEmail, body) => {
  const s3Key = `${userEmail}/${Date.now()}.txt`;
  const params = {
    Bucket: bucketName,
    Key: s3Key,
    Body: body,
  };
  console.log(params);
  const data = await s3.upload(params).promise();
  return data.Key;
};

exports.getUserEmails = async (userEmail) => {
  const params = {
    Bucket: bucketName,
    Prefix: `${userEmail}/`,
  };
  const data = await s3.listObjectsV2(params).promise();
  return data.Contents.map(item => ({
    key: item.Key,
    size: item.Size,
    lastModified: item.LastModified,
  }));
};
