'use strict';

// npm sequelize-cli seed:generate --name watering-circuits
// npx sequelize-cli db:seed:all --debug
// make sure to add in the createdAt and updatedAt apparently -- why wouldn't it do this automatically?
// or at least provide template for it?


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   // 1 = Radio North = 8 channels (0-7 GPIO) | 4 = On | 5 = Off
   // 2 = Radio South
    await queryInterface.bulkInsert('WateringCircuits', [
      {
        radioId: 1,
        name: 'East Trees',
        number: 1,
        gpionumber: 0,
        description: 'East Trees incl Locust',
        onstate: 4,
        offstate: 5,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 1,
        name: 'Gardens',
        number: 2,
        gpionumber: 1,
        description: 'Gardens typically short duration',
        onstate: 4,
        offstate: 5,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 1,
        name: 'Lawn Center',
        number: 3,
        gpionumber: 2,
        description: 'Lawn Center',
        onstate: 4,
        offstate: 5,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 1,
        name: 'Lawn West',
        number: 4,
        gpionumber: 3,
        description: 'Lawn West',
        onstate: 4,
        offstate: 5,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 1,
        name: 'Trees West',
        number: 5,
        gpionumber: 4,
        description: 'Mulberries Cottonwoods West',
        onstate: 4,
        offstate: 5,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 1,
        name: 'Trees Northwest and West Bed',
        number: 6,
        gpionumber: 5,
        description: 'incl Roses and West Bed',
        onstate: 4,
        offstate: 5,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 1,
        name: 'Trees Shed Shop',
        number: 8,
        gpionumber: 7,
        description: 'incl East Bed',
        onstate: 4,
        offstate: 5,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 2,
        name: 'South/Front Beds',
        number: 1,
        gpionumber: 0,
        description: 'incl Pines East and Shrubs',
        onstate: 5,
        offstate: 4,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 2,
        name: 'Trees Desert Willows',
        number: 2,
        gpionumber: 1,
        description: 'incl what else?',
        onstate: 5,
        offstate: 4,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      },
      {
        radioId: 2,
        name: 'Lawn Misc Not In Use',
        number: 3,
        gpionumber: 2,
        description: 'legacy / repurpose',
        onstate: 5,
        offstate: 4,
        createdAt: new Date(), // this seems tedious, but is required by default
        updatedAt: new Date() // same comment as above
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('WateringCircuits', null, {});
  }
};
