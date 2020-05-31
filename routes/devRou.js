var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('dev', { title: 'Dev and Mgmt Notes' });
});

module.exports = router;
