const express = require('express');
const router = express.Router();

// Require the controllers
const mdbradio_controller = require('../controllers/mdbradioCon.js');


router.get('/test', mdbradio_controller.test);
router.post('/create', mdbradio_controller.create);
router.get('/', mdbradio_controller.list);
router.get('/list', mdbradio_controller.list);
router.get('/:id', mdbradio_controller.details); // just: mdbradios/id where id - check db - approx GUID object
router.put('/:id/update', mdbradio_controller.update);
router.delete('/:id/delete', mdbradio_controller.delete);
router.post('/updateMacByName', mdbradio_controller.updateMacByName);

router.get('/:id/edit', mdbradio_controller.details);
router.post('/addchannel', mdbradio_controller.addchannel);

module.exports = router;
