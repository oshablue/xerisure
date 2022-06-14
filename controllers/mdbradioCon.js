const Mdbradio = require('../models/mdbradioMod.js');
const Wateringchannel = require('../models/wateringcircuitMod.js');

// Test basic wiring
exports.test = function (req, res) {
    res.send('Greetings from the Test controller!');
};

// Probably need to wrap up for hidden nested await errors
// https://itnext.io/using-async-routes-with-express-bcde8ead1de8
exports.list = async function (req, res, next) {
  var dat = await Mdbradio.listAll();
  //return res.send(dat);
  return res.render('radios', {radios_list: dat})
}

exports.create = function (req, res, next) {

  let radio = new Mdbradio(
    {
      // This will work with eg Postman and using Header: Content-Type = application/json
      // choose Body => raw and select JSON
      // and then add body eg:
      // { "name":"radioName", "mac":"ff:..." }
      name: req.body.name,
      mac: req.body.mac,
      description: req.body.description

      // Wow.  When params are passed eg. by Postman using
      // POST request with Params and application/x-www-form-urlencoded
      // then we need to use the query object, not the body object
      // as of this stack/toolchain and writing
      //name: req.query.name,
      //mac: req.query.mac
    }
  );

  radio.save(function(err) {
    if (err) {
      console.log(req);
      console.log("req.body: " + JSON.stringify(req.body));
      console.log(req.params);
      console.log(err);
      return next(err);
    }
    res.send('Mdbradio created successfully');
  });

};



// Details
exports.details = function ( req, res, next ) {
  //var radio = Mdbradio.findById(req.params.id, function (err, radio) {
  //  if (err) return next (err);
    //res.send(radio);
    //return res.render('radiodetail', {radio_details: radio}) // How to populate the wateringcircuit details with more than just the id in the view?
  //}).populate('wateringcircuits');
  //return res.render('radiodetail', {radio_details: radio});
  
  Mdbradio.
	findById(req.params.id).
	populate('wateringcircuits').
	exec( function(err, radio) {
		if (err) return next (err);
		return res.render('radiodetail', {radio_details: radio});
	});
};





// Update
// Test:
// localhost:3000/mdbradios/5c50a16b19cca70f54bae057/update/
// with JSON body content and type set in Postman to raw => JSON (application/json)
// { "name":"NewRadioName", "mac":"ff:00:11:12:ee:00:11:22" }
exports.update = function ( req, res, next ) {
  Mdbradio.findByIdAndUpdate(
    req.params.id,
    {$set: req.body},
    function ( err, radio ) {
      if ( err ) return next (err);
      res.send('Mdbradio updated.');
    }
  );
};


// Uses 2-way adding for when radio also stores the watering channel ids
exports.addchannel2way = function ( req, res, next ) {
	var d = "post is: " +  JSON.stringify(req.body);
	let wc = new Wateringchannel(req.body);
	wc.save(function(err) {
		Mdbradio.findById(req.body.radio, function (err, radio) {
			if (err) return next (err);
			//res.send(radio);
			//return res.render('radiodetail', {radio_details: radio})
			radio.wateringcircuits.push(wc); // not actually best method for unbounded - use virtuals - though it is functional
			radio.save(); // TODO error handling 
		  });
		if (err) {
		  console.log(req);
		  console.log("req.body: " + JSON.stringify(req.body));
		  console.log(req.params);
		  console.log(err);
		  return next(err);
		}
		res.send('Watering channel created (added to radio) successfully' + d);
	});
};


// For when radio model schema uses virtual one-to-many
exports.addchannel = function ( req, res, next ) {
	var d = "post is: " +  JSON.stringify(req.body);
	let wc = new Wateringchannel(req.body);
	wc.save(function(err) {
		if (err) {
		  console.log(req);
		  console.log("req.body: " + JSON.stringify(req.body));
		  console.log(req.params);
		  console.log(err);
		  return next(err);
		}
		res.send('Watering channel created (added to radio) successfully ' + d);
	});
};


exports.clearwateringchannels = function ( req, res, next ) {
	
	Mdbradio.findByIdAndUpdate(
      req.params.id,
      {$set: { "wateringcircuits": [] } },
      function ( err, radio ) {
        if ( err ) return next (err);
        res.send('Mdbradio updated.');
      }
    );
	
};






exports.updateMacByName = function ( req, res, next ) {
  Mdbradio.findOneAndUpdate(
  {
    "name": req.body.name
  }, {
    $set: {
      "mac": req.body.mac,
      "description" : req.body.description
    }
  },
  function ( err, radio ) {
    if ( err ) return next (err);
    res.send('Mdbradio updated (by name).');
  }
  );
};




// Delete
// Test:
// localhost:3000/mdbradios/5c50a16b19cca70f54bae057/delete
// using a DELETE request in postman
exports.delete = function ( req, res, next ) {
  Mdbradio.findByIdAndRemove(
    req.params.id,
    function (err) {
      if (err) return next(err);
      res.send('Deleted successfully');
    }
  );
};
