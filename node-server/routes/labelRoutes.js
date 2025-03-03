const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labelController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

router.get('/get', authenticateJWT, labelController.getLabels);
router.post('/update', authenticateJWT, labelController.updateLabels);

module.exports = router;
