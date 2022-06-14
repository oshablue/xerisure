const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//const Wateringcircuit = require('./wateringcircuitMod.js');


let MdbradioSchema = new Schema({
    name: {type: String, required: true, max: 100},
    mac: {type: String, required: true},
    description: {type: String, required: false, max: 1000},
    //test: {type: String, default: "Yeah" }, // yes requires an app restart like pm2 restart 0
    wateringcircuits: [{ type: Schema.Types.ObjectId, ref: 'Wateringcircuit' }]
});




// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
MdbradioSchema.statics.listAll = async function listAll () {
  try {
	  //var rs = await this.find().exec(); 
	  //var wcs = await Wateringcircuit.find().exec();
    //return (rs, wcs); // await this.find().exec(); //.lean().exec();
    return await this.find().populate('wateringcircuits').exec();
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




MdbradioSchema.statics.storeAll = async function storeAll(radios) {
  try {
    if (radios) {
      radios.forEach(async function(r){
        let rinst = new Mdbradio({
          name: r.name.replace(/[^\w\s]/,""),
          mac: r.mac.replace(/\W/g,""),
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
var Mdbradio = module.exports = mongoose.model('Mdbradio', MdbradioSchema);
