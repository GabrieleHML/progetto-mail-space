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

exports.addLabel = async (req, res) => {
    try {
        const labelName = req.body.name;
        const userEmail = req.user.email;
    
        if (!labelName) {
        return res.status(400).json({ message: 'Label name is required' });
        }
    
        const labelId = await rdsService.addLabel(userEmail, labelName);
        res.json({ message: 'Label added successfully', labelId });
    } catch (error) {
        res.status(500).json({ message: 'Error adding label', error });
    }
};

exports.deleteLabel = async (req, res) => {
    try {
        const labelName = req.body.name;
        const userEmail = req.user.email;
    
        if (!labelName) {
        return res.status(400).json({ message: 'Label name is required' });
        }
    
        await rdsService.deleteLabel(userEmail, labelName);
        res.json({ message: 'Label deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting label', error });
    }
};