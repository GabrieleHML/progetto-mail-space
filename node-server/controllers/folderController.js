const rdsService = require('../services/rdsService');

exports.addFolder = async (req, res) => {
  try {
    const folderName = req.body.name;
    const userEmail = req.user.email;

    if (!folderName) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const folderId = await rdsService.addFolder(userEmail, folderName);
    res.json({ message: 'Folder added successfully', folderId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding folder', error });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const folders = await rdsService.getFolders(userEmail);
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving folders', error });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folderId = req.body.folderId;

    if (!folderId) {
      return res.status(400).json({ message: 'Folder ID is required' });
    }

    await rdsService.deleteFolder(folderId);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting folder', error });
  }
};

exports.addEmailsToFolder = async (req, res) => {
  try {
    const folderId = req.body.folderId;
    const s3Keys = req.body.s3Keys;
    if (!folderId || !Array.isArray(s3Keys) || s3Keys.length === 0) {
      return res.status(400).json({ message: 'Folder ID and s3Keys are required' });
    }

    await rdsService.addEmailsToFolder(s3Keys, folderId);
    res.json({ message: 'Emails added to folder successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding emails to folder', error });
  }
};

exports.getEmailsFromFolder = async (req, res) => {
  try {
    const folderId = req.body.folderId;

    if (!folderId) {
      return res.status(400).json({ message: 'Folder ID is required' });
    }

    const emails = await rdsService.getEmailsFromFolder(folderId);
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving emails from folder', error });
  }
};

exports.removeEmailsFromFolder = async (req, res) => {
  try {
    const folderId = req.body.folderId;
    const s3Keys = req.body.s3Keys;

    if (!folderId || !Array.isArray(s3Keys) || s3Keys.length === 0) {
      return res.status(400).json({ message: 'Folder ID and s3Keys are required' });
    }

    await rdsService.removeEmailsFromFolder(s3Keys, folderId);
    res.json({ message: 'Emails removed from folder successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing emails from folder', error });
  }
};


