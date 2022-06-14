const Mdbradio = require('../models/mdbradioMod.js');
const Wateringcircuit = require('../models/wateringcircuitMod.js');

exports.list = async function (req, res, next) {
  var dat = await Wateringcircuit.find().exec();
  return res.send(dat);
  //return res.render('radios', {wateringcircuit_list: dat})
}

exports.clearall = function ( req, res, next ) {
  Wateringcircuit.deleteMany({},
    function (err) {
      if (err) return next(err);
      res.send('Deleted all watering circuits. Caution, wateringcircuit IDs not deleted from radios if implemented as non virtual ref.');
    }
  );
};
