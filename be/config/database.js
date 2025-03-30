import{ Sequelize } from "sequelize";

const db = new Sequelize("tugas2-notes", "root", "", {
    host: "localhost",
    dialect: "mysql"
})

export default db;
