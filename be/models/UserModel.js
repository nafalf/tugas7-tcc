import { Sequelize } from "sequelize"
import db from "../config/database.js"

const { DataTypes } = Sequelize;

const User = db.define(
    "user", 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        date: DataTypes.DATE,
        note: DataTypes.STRING
    }
)

db.sync().then(() => console.log("Database Synchronized"))

export default User;