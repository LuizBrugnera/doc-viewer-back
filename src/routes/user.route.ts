import express from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleAuthMiddleware } from "../middlewares/roleAuth.middleware";

const userRoutes = express.Router();

userRoutes.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin"]);
  },
  userController.create
);

userRoutes.get(
  "/",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin"]);
  },
  userController.findAll
);

userRoutes.put("/update-info", authMiddleware, userController.update);

userRoutes.get(
  "/find-by-department",
  authMiddleware,
  userController.findUsersByDepartment
);

userRoutes.put(
  "/:id",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin"]);
  },
  userController.update
);

userRoutes.delete(
  "/:id",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin"]);
  },
  userController.delete
);

export default userRoutes;
