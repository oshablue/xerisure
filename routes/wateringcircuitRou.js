const express = require('express');
const router = express.Router();

// Require the controllers
const wateringcircuit_controller = require('../controllers/wateringcircuitCon.js');

router.get('/', wateringcircuit_controller.list);
router.get('/clearall', wateringcircuit_controller.clearall);

module.exports = router;
