const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Wateringcircuit = require('./wateringcircuitMod.js');
const Mdbradio = require('./mdbradioMod.js');


let LogSchema = new Schema({
	
    wateringcircuit: {type: Schema.Types.ObjectId, ref: 'Wateringcircuit'},
    eventType: { 
		//type: Schema.Types.ObjectId, ref: 'LogEventType' 
		type: String,
		enum: [
			'waterOn', 'waterOff', 'notSet'
		],
		default: 'notSet'
	},
    description: { type: String, required: false, max: 1000}

}, {
	timestamps: true,
	toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//let LogEventTypeSchema = new Schema({
	//eventtypeName: { type: String }
//}, {
	
//});

// arunrajeevan.medium.com/mongodb-schema-using-mongoosee-19aeffdf772f
// TODO add input to feed into the description, including last confirming get DIO state result from eg gatewayMod.js call?
LogSchema.statics.createDioEntryByMacAndPin = async function (macid, pin, state) { 
	
	console.log('createEntryByMacAndPin');
	console.log(macid, pin, state);
	
	var wc_id = '';
	var waterOnOff = 'notSet';
	
	Mdbradio.find({})
	.populate({
	    path: 'wateringcircuits',
	    match: { gpionumber: pin}
 	})
	.where('mac').equals(macid).select('wateringcircuits')
	.exec( function(err, wcs) {
		if ( err ) console.log(err);
		// if any, returns 
		// [ radio, wateringcircuits[] ]
		console.log(JSON.stringify(wcs));
		console.log(JSON.stringify(wcs[0].wateringcircuits[0])); // array of the wateringcircuits for a radio
		
		wc_id = wcs[0].wateringcircuits[0]._id;
		console.log(wc_id);
		
		let onState = wcs[0].wateringcircuits[0].onstate;
		let offState = wcs[0].wateringcircuits[0].offstate;
		
		if ( state == onState ) {
			waterOnOff = 'waterOn';
		}
		if ( state == offState ) {
			waterOnOff = 'waterOff';
		}
		console.log('waterOnOff: ' + waterOnOff);
		
		let le = new Log({
			wateringcircuit: wc_id,
			eventType: waterOnOff, // waterOn, waterOff, notSet
			description: ''
		});
		le.save( function (err) {
			if (err) {
		      console.log(err);
		      console.log("on save: " + JSON.stringify(le));
		      //console.log(le);
		      //console.log(err);
		      //return next(err);
			}
		});
		
	});
};



// Export the model
// Yes this needs to go at the end to export the statics for example
var Log = module.exports = mongoose.model('Log', LogSchema);
//var LogEventType = module.exports = mongoose.model('LogEventType', LogEventTypeSchema);
