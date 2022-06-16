const express = require('express');
const router = express.Router();

// Require the controllers
const log_controller = require('../controllers/logCon.js');

router.get('/', log_controller.list);
router.get('/clearall', log_controller.clearall); // Danger will robinson


module.exports = router;
