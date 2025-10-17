//const mongoose = require('mongoose');
//const Schema = mongoose.Schema;

const {sequelize} = require('../db');
const {DataTypes} = require('sequelize');

const dayjs = require('dayjs');

const Radio = require('./Radio');
const LogEvent = require('./LogEvent'); // circular ref?


//let WateringCircuit = new Schema({
const WateringCircuit = sequelize.define('wateringcircuit', {
	name: {type: DataTypes.STRING, allowNull: true, max: 100},
	// Common channel number in normal human conversation
	number: {type: DataTypes.TINYINT, allowNull: false, default: -1},
	// GPIO number is base 0
	gpionumber: {type: DataTypes.TINYINT, allowNull: false, default: -1, min: 0, max: 255}, 
	description: {type: DataTypes.STRING, allowNull: true, max: 1000},
	// In standard DM radios default for current relay set up in live action is 4 = activate relay, open valve
	onstate: {type: DataTypes.TINYINT, allowNull: false, min: 0, max: 255, default: 4},
	offstate: {type: DataTypes.TINYINT, allowNull: false, min: 0, max: 255, default: 5},
	//radio: { type: Schema.Types.ObjectId, ref: 'Mdbradio' }
  // radio_id: { // Trying explicity id reference here?
  //   type: DataTypes.INTEGER, 
  //   references: {
  //     model: 'Mdbradio',
  //     key: 'id'
  //   }
  // },
  // logEvents: {
  //   type: DataTypes.VIRTUAL,
  //   get() {
  //     return `${this.LogEvents}`;
  //   },
  //   set(value) {
  //     throw new Error('Do not try to set the `logEvents` value!');
  //   },
  // },
  lastActiveString: {
    type: DataTypes.VIRTUAL, 
    get() {
      if ( !this.logevents || this.logevents.length <1 ) {
        return 'Log empty';
      }
      if ( this.logevents.length == 1 ) {
        return this.logevents[0].eventType + " " + this.logevents[0].createdAt + " <b>Only 1 log entry!</b>";
      }
      this.logevents.sort((a,b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // This order will put the later date first
      });
      var recentLe = this.logevents[0]; //[0];
      var recTimeS = new dayjs (recentLe.createdAt.getTime());
      var previousLe = this.logevents[1]; //[1];
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
    }
  },
});

// https://sequelize.org/docs/v6/core-concepts/assocs/
// WateringCirc would have the foreign key
// Radio has many watering circuits
// Would want 
// Radio.hasMany(WateringCirc) where foreign key is in wateringcirc
// Does it work to define that here?
Radio.hasMany(WateringCircuit);
WateringCircuit.belongsTo(Radio);




//WateringCircuit.virtual('logEvents', {
// WateringCircuit.virtual('logEvents', {
//   ref: 'Log',
//   localField: '_id',
//   foreignField: 'wateringcircuit',
//   options: { sort: { 'createdAt': 'desc' } } // yay // non existent returns [] now
// });




// WateringCircuit.virtual('lastActiveString').get( function () {
//   if ( !this.logEvents || this.logEvents.length <1 ) {
//     return 'Log empty';
//   }
//   if ( this.logEvents.length == 1 ) {
//     return this.logEvents[0].eventType + " " + this.logEvents[0].createdAt + " <b>Only 1 log entry!</b>";
//   }
//   var recentLe = this.logEvents[0];
//   var recTimeS = new dayjs (recentLe.createdAt.getTime());
//   var previousLe = this.logEvents[1];
//   var prevTimeS = new dayjs (previousLe.createdAt.getTime());
//   var wateringDur = recentLe.createdAt.getTime() - previousLe.createdAt.getTime(); // ms
//   var res = "";
//   var classStr = "";
//   var titleStr = "";
//   if ( recentLe.eventType != 'waterOff' ) {
//     classStr = "logEventBad";
//     titleStr = "Hmmm... most recent event should probably be waterOff (not waterOn)";
//   }
//   res += "<span class=\"" + classStr + "\" title=\"" + titleStr + "\">";
//   res += recentLe.eventType + "</span> " + recTimeS.format("MMM-DD/YY h:mm:ssA").toString() + "<br>"; // need datejs ? to get the formatted string output?
//   classStr = "";
//   titleStr = "";
//   if ( previousLe.eventType != 'waterOn' ) {
//     classStr = "logEventBad";
//     titleStr = "Hmmm... 2nd most recent event should probably be waterOn (not waterOff)";
//   }
//   res += "<span class=\"" + classStr + "\" title=\"" + titleStr + "\">";
//   res += previousLe.eventType + "</span> " + prevTimeS.format("MMM-DD/YY h:mm:ssA").toString() + "<br>";
//   res += "(for " + Math.round(wateringDur/60000.0, 2) + " min.)"; // change to toFixed maybe for actual decimal places?
  
//   return res; // + "<br><br>" + JSON.stringify([this.logEvents[0], this.logEvents[1]]);
// });


// Add this virtual method to calculate duration for a specific watering session

// LogEvent.prototype.calculateWateringDuration = async function() {
//   if (!isWateringOnEvent(this.event_type)) {
//     return null; // Only calculate for "on" events
//   }
  
//   // Find the next "off" event for the same channel after this "on" event
//   const offEvent = await LogEvent.findOne({
//     where: {
//       createdAt: { [Op.gt]: this.createdAt },
//       // Add channel matching logic here based on your schema
//       // pin_number: this.pin_number,
//       // mac_id: this.mac_id,
//     },
//     order: [['createdAt', 'ASC']]
//   });
  
//   if (offEvent && isWateringOffEvent(offEvent.event_type)) {
//     const durationMs = new Date(offEvent.createdAt) - new Date(this.createdAt);
//     return Math.round(durationMs / (1000 * 60)); // Return minutes
//   }
  
//   return null;
// };


// Export the model
// Yes this needs to go at the end to export the statics for example
var Wateringcircuit = module.exports = WateringCircuit; // mongoose.model('Wateringcircuit', WateringCircuit);
