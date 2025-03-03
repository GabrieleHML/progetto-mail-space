const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/confirm', authController.confirm);
router.post('/signin', authController.signin);
router.post('/logout', authenticateJWT, authController.logout);

router.post('/requestPasswordReset', authController.requestPasswordReset);
router.post('/resetPassword', authController.resetPassword);
router.post('/changePassword', authenticateJWT, authController.changePassword);

module.exports = router;