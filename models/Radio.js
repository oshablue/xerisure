//const mongoose = require('mongoose');
//const Schema = mongoose.Schema;

//const Wateringcircuit = require('./wateringcircuitMod.js');



// 2025Q2 this would have been for MongoDB 
// the schemas that is
// For mysql ...
// let MdbradioSchema = new Schema({
//     name: {type: String, required: true, max: 100},
//     mac: {type: String, required: true},
//     description: {type: String, required: false, max: 1000}
//     //test: {type: String, default: "Yeah" }, // yes requires an app restart like pm2 restart 0
//     // for wateringcircuits we move to virtual
//     //wateringcircuits: [{ type: Schema.Types.ObjectId, ref: 'Wateringcircuit' }]
// }, {
// 	toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

// MdbradioSchema.virtual('wateringcircuits', {
// 	ref: 'Wateringcircuit',
// 	localField: '_id',
// 	foreignField: 'radio'
// });


const {sequelize} = require('../db');
const {DataTypes} = require('sequelize');

//console.log(sequelize)




// THis works but TODO this is supposed to live in app.js or separate db.js file and then get imported
// const {Sequelize} = require ("sequelize");
// const sequelize = new Sequelize(
//   {
//     dialect: "sqlite",
//     host:"./xerisure-6-6-25.sqlite"
//   }
// );

// const connectedDB = async () => {
//   sequelize.sync();
//   await sequelize.authenticate();
//   console.log("Connected to DB".yellow.underline);
// };



const Radio = sequelize.define('radio', {

  name: {type: DataTypes.STRING(180), allowNull:false }, // required: true, max: 100},
  macid: {type: DataTypes.STRING(80), allowNull: false},
  description: {type: DataTypes.STRING, allowNull: true}
    //test: {type: String, default: "Yeah" }, // yes requires an app restart like pm2 restart 0
    // for wateringcircuits we move to virtual
    //wateringcircuits: [{ type: Schema.Types.ObjectId, ref: 'Wateringcircuit' }]

});




// Synchronize all models
// sequelize.sync({ force: true }) // Force true will overwrite field names or add new columns etc but will also kill existing data entries (!)
//   .then(() => {
//     console.log("Database synchronized successfully");
//   })
//   .then(() => {
//     const radios = Radio.findAll().then((radios) => {
//       console.log(radios.every(radio => radio instanceof Radio)); // true
//       console.log('All radios:', JSON.stringify(radios, null, 2));
//     })
//   })
//   .catch(err => {
//     console.error("Unable to synchronize database", err);
//   });




// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
// was MdbradioSchema.statics.listAll
Radio.listAll = async function listAll () {
  try {
	  //var rs = await this.find().exec(); 
	  //var wcs = await Wateringcircuit.find().exec();
    //return (rs, wcs); // await this.find().exec(); //.lean().exec();
    return await this.findAll(); //.populate('wateringcircuits').exec();
  } catch (err) {
    console.log(err);
  }
  // .find() returns a Query object
  // .exec() returns a Promise
  // If we are using async/await, it will only pause with a Promise as the Returned
  // object
  // Callback is not a Promise
  // Don't mix callbacks with async-await
};




//Radio.statics.storeAll = async function storeAll(radios) {
Radio.storeAll = async function storeAll(radios) {
  try {
    if (radios) {
      radios.forEach(async function(r){
        let rinst = new Mdbradio({
          name: r.name.replace(/[^\w\s]/,""),
          macid: r.mac.replace(/\W/g,""),
          description: r.description
        });
        await rinst.save(function(err) {
          if (err) console.log(err);
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
}








// Export the model
// Yes this needs to go at the end to export the statics for example
//var Radio = module.exports = Radio; // mongoose.model('Mdbradio', MdbradioSchema);
module.exports = Radio;