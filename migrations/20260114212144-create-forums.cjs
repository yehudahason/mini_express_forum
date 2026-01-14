"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("forums", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });

    // Helpful index for slug lookups
    await queryInterface.addIndex("forums", ["slug"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("forums");
  },
};
