const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Log = require('./logMod');


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
}, {
	toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


WateringcircuitSchema.virtual('logEvents', {
  ref: 'Log',
  localField: '_id',
  foreignField: 'wateringcircuit',
  options: { sort: { 'createdAt': 'desc' } } // yay // non existent returns [] now
});

WateringcircuitSchema.virtual('lastActiveString').get( function () {
  if ( !this.logEvents || this.logEvents.length <1 ) {
    return 'Log empty';
  }
  if ( this.logEvents.length == 1 ) {
    return this.logEvents[0].eventType + " " + this.logEvents[0].createdAt + " <b>Only 1 log entry!</b>";
  }
  var recentLe = this.logEvents[0];
  var recTimeS = new Date (recentLe.createdAt.getTime());
  var previousLe = this.logEvents[1];
  var wateringDur = recentLe.createdAt.getTime() - previousLe.createdAt.getTime(); // ms
  var res = "";
  var classStr = "";
  if ( recentLe.eventType != 'waterOff' ) {
    classStr = "logEventBad";
  }
  res += "<span class=\"" + classStr + "\">";
  res += recentLe.eventType + " " + recTimeS.toString("DD/MM/YY h:mm:ss") + "</span><br>"; // need datejs ? to get the formatted string output?
  classStr = "";
  if ( previousLe.eventType != 'waterOn' ) {
    classStr = "logEventBad";
  }
  res += "<span class=\"" + classStr + "\">";
  res += previousLe.eventType + " " + previousLe.createdAt + "</span><br>";
  res += "(for " + Math.round(wateringDur/60000.0, 2) + " mins)"; // change to toFixed maybe for actual decimal places?
  
  return res; // + "<br><br>" + JSON.stringify([this.logEvents[0], this.logEvents[1]]);
});


// Export the model
// Yes this needs to go at the end to export the statics for example
var Wateringcircuit = module.exports = mongoose.model('Wateringcircuit', WateringcircuitSchema);
