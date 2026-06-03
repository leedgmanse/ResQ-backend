const express = require('express');
const router = express.Router();
const { getAlerts, getCategories, getAlertById, getNearbyAlerts } = 
require('../controllers/alertsController');

router.get('/categories', getCategories);
router.get('/nearby', getNearbyAlerts);
router.get('/:id', getAlertById);
router.get('/', getAlerts);

module.exports = router;