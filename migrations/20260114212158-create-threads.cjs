"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("threads", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      forum_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "forums",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.addIndex("threads", ["forum_id"]);
    await queryInterface.addIndex("threads", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("threads");
  },
};
