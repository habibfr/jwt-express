import express from "express";
import UserController from "../controller/user-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { refreshToken } from "../controller/refresh-token.js";

const router = express.Router();

router.get("/users", verifyToken, UserController.getUsers);
router.post("/users", UserController.register);
router.post("/login", UserController.login);
router.get("/token", refreshToken);
router.delete("/logout", UserController.logout);

export default router;
