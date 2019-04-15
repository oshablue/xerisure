var express = require('express');
var router = express.Router();

var gateway_controller = require('../controllers/gatewayCon');

/* Since this IS the gateway router, /gateway = / all by its lonesome */
//router.get('/', gateway_controller.serial_port_list);
router.get('/', gateway_controller.initialize_serial);

module.exports = router;
