const express = require('express');
const router = express.Router();
const { createUser, getSettings, updateSettings } = require('../controllers/usersController');
const { upsertQrProfile } = require('../controllers/qrController');

router.post('/', createUser);
router.get('/:userId/settings', getSettings);
router.put('/:userId/settings', updateSettings);
router.post('/:userId/qr-profile', upsertQrProfile);

module.exports = router;