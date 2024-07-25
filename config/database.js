import { Sequelize } from "sequelize";

const db = new Sequelize("latihan_jwt", "postgres", "habibfr", {
  host: "localhost",
  dialect: "postgres",
});

export default db;
