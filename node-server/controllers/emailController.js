const s3Service = require('../services/s3Service');
const comprehendService = require('../services/comprehendService');

exports.uploadEmail = async (req, res) => {
  try {
    const { mittente, testo } = req.body;
    const userEmail = req.user.email;

    const s3Key = await s3Service.uploadEmail(userEmail, testo);
    const { terminiUsati, argomento } = await comprehendService.analyzeText(testo);

    res.json({ s3Key, terminiUsati, argomento });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading email', error });
  }
};

exports.getUserEmails = async (req, res) => {
  try {
    const emails = await s3Service.getUserEmails(req.user.email);
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emails', error });
  }
};
