const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.post('/upload', authenticateJWT, emailController.uploadEmail);
router.get('/user-emails', authenticateJWT, emailController.getUserEmails);

module.exports = router;
