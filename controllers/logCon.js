//const Mdbradio = require('../models/mdbradioMod.js');
//const Wateringcircuit = require('../models/wateringcircuitMod.js');
const Log = require('../models/logMod.js');

exports.list = async function (req, res, next) {
  var dat = await Log.find({}).sort({ createdAt: 'desc' }).populate('wateringcircuit').exec();
  //return res.send(dat);
  return res.render('logs', {log_entries: dat})
}


// TODO Danger whiskey romeo
exports.clearall = function ( req, res, next ) {
  Log.deleteMany({},
    function (err) {
      if (err) return next(err);
      res.send('Deleted all log entries.');
    }
  );
};




