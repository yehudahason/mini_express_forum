"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("replies", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      thread_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "threads",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      author: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Helpful indexes
    await queryInterface.addIndex("replies", ["thread_id"]);
    await queryInterface.addIndex("replies", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("replies");
  },
};
