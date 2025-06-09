//const mongoose = require('mongoose');
//const Schema = mongoose.Schema;


const {sequelize} = require('../db.js');
const {DataTypes} = require('sequelize');

const colors = require('colors');

const WateringCircuit = require('./WateringCircuit');
const Radio = require('./Radio');


//var socket = io('/gateway');




// let LogSchema = new Schema({
	
//     wateringcircuit: {type: Schema.Types.ObjectId, ref: 'Wateringcircuit'},
//     eventType: { 
// 		//type: Schema.Types.ObjectId, ref: 'LogEventType' 
// 		type: String,
// 		enum: [
// 			'waterOn', 'waterOff', 'notSet'
// 		],
// 		default: 'notSet'
// 	},
//     description: { type: String, required: false, max: 1000}

// }, {
// 	timestamps: true,
// 	toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

//let LogEventTypeSchema = new Schema({
	//eventtypeName: { type: String }
//}, {
	
//});


// const LogSchema = sequelize.define('LogSchema', {
// 	wateringcircuit_id: { 
// 		type: DataTypes.INTEGER, // Schema.Types.ObjectId, 
// 		references: {
// 			model: 'Wateringcircuit',
// 			key: 'id'
// 		}
// 	},
// 	eventType: {
// 		//type: Schema.Types.ObjectId, ref: 'LogEventType' 
// 		type: String,
// 		enum: [
// 			'waterOn', 'waterOff', 'notSet'
// 		],
// 		default: 'notSet'
// 	},
// 	description: { 
// 		type: DataTypes.STRING(1000), 
// 		allowNull: true, 
// 	},
// 	// Timestampts included by default
// });

// Relation to watercircuit happens in the watercircuit model file
const LogEvent = sequelize.define('logevent', {
	eventType: {
		//type: Schema.Types.ObjectId, ref: 'LogEventType' 
		type: DataTypes.ENUM('waterOn', 'waterOff', 'notSet'),
		defaultValue: 'notSet'
	},
	description: { 
		type: DataTypes.STRING(1000), 
		allowNull: true, 
	},
	// Timestampts included by default
});


WateringCircuit.hasMany(LogEvent);
LogEvent.belongsTo(WateringCircuit); // Seemed to be working without this


// arunrajeevan.medium.com/mongodb-schema-using-mongoosee-19aeffdf772f
// TODO add input to feed into the description, including last confirming get DIO state result from eg gatewayMod.js call?
//LogEvent.statics.createDioEntryByMacAndPin = async function (macid, pin, state) { 

LogEvent.createDioEntryByMacAndPin = async function (macid, pin, state) { 

	console.log('createEntryByMacAndPin');
	console.log(macid, pin, state);
	
	var wc_id = '';
	var waterOnOff = 'notSet';
	
	// Radio.find({})
	// .populate({
	//     path: 'wateringcircuits',
	//     match: { gpionumber: pin}
 	// })
	// .where('mac').equals(macid).select('wateringcircuits')
	// .exec( function(err, wcs) {
	// 	if ( err ) console.log(err);

	var radio = await Radio.findAll({
		where: {
      macid: macid, 
    },
    include: [{ 
        model: WateringCircuit,
				where: { 
					gpionumber: pin
				}
    }],
	});

	console.log(`Found this watering circuit for log event addition: ${JSON.stringify(radio, null, 2)}`)


	// if any, returns 
	// [ radio, wateringcircuits[] ]
	let wc = radio[0].wateringcircuits[0];
	console.log(JSON.stringify(wc));
	//console.log(JSON.stringify(wcs[0].wateringcircuits[0])); // array of the wateringcircuits for a radio

	wc_id = wc.id; // wcs[0].wateringcircuits[0]._id;
	console.log(`wateringcircuit id: ${wc_id}`);

	let onState = wc.onstate; // wcs[0].wateringcircuits[0].onstate;
	let offState = wc.offstate; //wcs[0].wateringcircuits[0].offstate;

	if (state == onState) {
		waterOnOff = 'waterOn';
	}
	if (state == offState) {
		waterOnOff = 'waterOff';
	}
	console.log('waterOnOff: ' + waterOnOff);

	// let le = new LogEvent({
	// 	wateringcircuit: wc_id,
	// 	eventType: waterOnOff, // waterOn, waterOff, notSet
	// 	description: ''
	// });
	// le.save( function (err) {
	// 	if (err) {
	//       console.log(err);
	//       console.log("on save: " + JSON.stringify(le));
	//       //console.log(le);
	//       //console.log(err);
	//       //return next(err);
	// 	}
	// });
	const new_le = await LogEvent.create({
		wateringcircuitId: wc_id,
		eventType: waterOnOff, // waterOn, waterOff, notSet
		description: ''
	});

	console.log(`created new logevent: ${JSON.stringify(new_le).yellow}`)

	const lec = await LogEvent.count({});
	console.log(`There are now ${lec} logevents in the table`);

	// Then ideally push some reload message to the UI to update any log message interpretations displayed
	// Ideally just the content of the corresponding log event last run at section is updated
	// And this probably should be refactored and located elsewhere
	// But to get it going now:
	//$('#macIdsSelSel').click(); // no jquery here yet
	//socket.emit('client_load_radio_data', macid); // need io here

		
	//});

};



// Export the model
// Yes this needs to go at the end to export the statics for example
module.exports = LogEvent; // mongoose.model('Log', LogSchema);
//var LogEventType = module.exports = mongoose.model('LogEventType', LogEventTypeSchema);
