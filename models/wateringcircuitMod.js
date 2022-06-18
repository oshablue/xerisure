const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Log = require('./logMod');

const dayjs = require('dayjs');


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
  var recTimeS = new dayjs (recentLe.createdAt.getTime());
  var previousLe = this.logEvents[1];
  var prevTimeS = new dayjs (previousLe.createdAt.getTime());
  var wateringDur = recentLe.createdAt.getTime() - previousLe.createdAt.getTime(); // ms
  var res = "";
  var classStr = "";
  var titleStr = "";
  if ( recentLe.eventType != 'waterOff' ) {
    classStr = "logEventBad";
    titleStr = "Hmmm... most recent event should probably be waterOff (not waterOn)";
  }
  res += "<span class=\"" + classStr + "\" title=\"" + titleStr + "\">";
  res += recentLe.eventType + "</span> " + recTimeS.format("MMM-DD/YY h:mm:ssA").toString() + "<br>"; // need datejs ? to get the formatted string output?
  classStr = "";
  titleStr = "";
  if ( previousLe.eventType != 'waterOn' ) {
    classStr = "logEventBad";
    titleStr = "Hmmm... 2nd most recent event should probably be waterOn (not waterOff)";
  }
  res += "<span class=\"" + classStr + "\" title=\"" + titleStr + "\">";
  res += previousLe.eventType + "</span> " + prevTimeS.format("MMM-DD/YY h:mm:ssA").toString() + "<br>";
  res += "(for " + Math.round(wateringDur/60000.0, 2) + " min.)"; // change to toFixed maybe for actual decimal places?
  
  return res; // + "<br><br>" + JSON.stringify([this.logEvents[0], this.logEvents[1]]);
});


// Export the model
// Yes this needs to go at the end to export the statics for example
var Wateringcircuit = module.exports = mongoose.model('Wateringcircuit', WateringcircuitSchema);
