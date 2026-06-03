const express = require('express');
const router = express.Router();
const { upsertQrProfile, getQrProfile } = require('../controllers/qrController');

router.get('/:qrToken', getQrProfile);

module.exports = router;