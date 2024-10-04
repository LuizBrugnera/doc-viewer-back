import express from "express";
import { logController } from "../controllers/log.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleAuthMiddleware } from "../middlewares/roleAuth.middleware";

const logRoutes = express.Router();

logRoutes.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin"]);
  },
  logController.create
);

logRoutes.delete(
  "/:id",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin"]);
  },
  logController.delete
);

logRoutes.get(
  "/find-by-user/:userId",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin"]);
  },
  logController.findByUserId
);

export default logRoutes;
