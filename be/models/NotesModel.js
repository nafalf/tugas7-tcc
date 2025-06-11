import { Sequelize } from "sequelize"
import db from "../config/database.js"

const { DataTypes } = Sequelize;

const Notes = db.define("notes", {
  Title: DataTypes.STRING,
  Content: DataTypes.STRING
});

// (async () => {
//   await db.sync();
// })();

db.sync().then(() => console.log("Database Synchronized"))

export default Notes;