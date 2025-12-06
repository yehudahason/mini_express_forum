import { sequelize } from "./models/index.js";
import "./models/associations.js";

async function syncDB() {
  try {
    await sequelize.authenticate();
    console.log("Connected!");

    await sequelize.sync({ alter: true }); // or { force: true } to drop everything

    console.log("Tables created/updated!");
  } catch (err) {
    console.error("Sync error:", err);
  }
}

syncDB();
