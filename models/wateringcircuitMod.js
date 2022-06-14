const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let WateringcircuitSchema = new Schema({
	name: {type: String, required: false, max: 100},
	// Common channel number in normal human conversation
	number: {type: Number, required: true, default: -1},
	// GPIO number is base 0
	gpionumber: {type: Number, required: true, default: -1, min: 0, max: 255}, 
	description: {type: String, required: false, max: 1000},
	// In standard DM radios default for current relay set up in live action is 4 = activate relay, open valve
	onstate: {type: Number, required: true, min: 0, max: 255, default: 4},
	offstate: {type: Number, required: true, min: 0, max: 255, default: 5},
	radio: { type: Schema.Types.ObjectId, ref: 'Mdbradio' }
});




// Export the model
// Yes this needs to go at the end to export the statics for example
var Wateringcircuit = module.exports = mongoose.model('Wateringcircuit', WateringcircuitSchema);
