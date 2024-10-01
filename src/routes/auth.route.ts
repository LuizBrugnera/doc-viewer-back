import express from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRoutes = express.Router();

authRoutes.post("/register", authController.register);

authRoutes.post("/login", authController.login);

authRoutes.post("/generate-code", authController.genereteCode);

authRoutes.post("/verify-code", authController.verifyCode);

authRoutes.post("/reset-password", authController.resetPassword);

authRoutes.post(
  "/change-password",
  authMiddleware,
  authController.updatePasswordWithPassword
);

authRoutes.post(
  "/update-data-token",
  authMiddleware,
  authController.updateDataToken
);

export default authRoutes;
