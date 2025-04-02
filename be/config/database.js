import{ Sequelize } from "sequelize";

const db = new Sequelize("tugas2-notes", "root", "", {
    host: "34.71.69.109",
    dialect: "mysql"
})

export default db;
