const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.post('/add', authenticateJWT, folderController.addFolder);
router.get('/list', authenticateJWT, folderController.getFolders);
router.post('/delete', authenticateJWT, folderController.deleteFolder);
router.post('/addEmails', authenticateJWT, folderController.addEmailsToFolder);
router.post('/getEmails', authenticateJWT, folderController.getEmailsFromFolder);
router.post('/removeEmails', authenticateJWT, folderController.removeEmailsFromFolder);
module.exports = router; 
