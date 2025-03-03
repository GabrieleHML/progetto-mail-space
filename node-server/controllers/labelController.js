const rdsService = require('../services/rdsService');

exports.getLabels = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const labels = await rdsService.getLabels(userEmail);
        res.json(labels);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving labels', error });
    }
};

exports.updateLabels = async (req, res) => {
  try {
    const labels = req.body.labels;
    const userEmail = req.user.email;

    if (!Array.isArray(labels)) {
      return res.status(400).json({ message: 'Labels must be an array' });
    }

    await rdsService.updateLabels(userEmail, labels);
    res.json({ message: 'Labels updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating labels', error });
  }
};