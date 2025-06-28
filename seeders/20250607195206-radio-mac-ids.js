'use strict';

// npm sequelize-cli seed:generate --name radio-mac-ids
// npx sequelize-cli db:seed:all --debug
// make sure to add in the createdAt and updatedAt apparently -- why wouldn't it do this automatically?
// or at least provide template for it?

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('Radios', [{
      id: 1,
      name: 'System 1',
      macid: '1234567840B72B04',
      description: 'System 1 Description ADD HERE',
      createdAt: new Date(), // this seems tedious, but is required by default
      updatedAt: new Date() // same comment as above
    },
    {
      id: 2,
      name: 'System 2',
      macid: '1234567840870A60',
      description: 'System 2 Description ADD HERE',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Radios', null, {});
  }
};
