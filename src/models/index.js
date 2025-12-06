import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  //"mini_forum",
  process.env.PGDATABASE,
  // "user",
  process.env.PGUSER,
  // "password",
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: "postgres",
    logging: false, // disable SQL logs
  }
);
