const express = require('express');
const HealthController = require('../controllers/healthController');

const router = express.Router();

// Health check route
router.get('/health', HealthController.healthCheck);

module.exports = router;
