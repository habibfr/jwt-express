import express from "express";
import db from "./config/database.js";
import Users from "./models/user-model.js";
import router from "./routes/router.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

try {
  await db.authenticate();
  console.log("database connect...");
  // await Users.sync();
} catch (error) {
  console.log(error);
}

app.use(cookieParser());
app.use(express.json());
app.use(router);

app.listen(5000, () => {
  console.log("Server running at port 5000");
});
