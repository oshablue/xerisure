const {Sequelize} = require ("sequelize");
const sequelize = new Sequelize(
  {
    dialect: "sqlite",
    host:"./xerisure-6-6-25.sqlite"
  }
);

//const Radio = require('./models/Radio')

const connectedDB = async () => {
  sequelize.sync();
  await sequelize.authenticate();
  console.log("Connected to DB".yellow.underline);
};

module.exports = { sequelize, connectedDB };