const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // cartella temporanea per i file caricati

router.post('/upload', authenticateJWT, emailController.uploadEmail);
router.post('/uploadFile', authenticateJWT, upload.single('emailFile'), emailController.uploadEmailFile);
router.post('/user-emails', authenticateJWT, emailController.getUserEmailsOrSearchBy);

module.exports = router;
