require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "jf2zypp99",
    database: process.env.DB_NAME || "forum",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },

  production: {
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "jf2zypp99",
    database: process.env.DB_NAME || "forum",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
};
