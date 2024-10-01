import express from "express";
import { notificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const notificationRoutes = express.Router();

notificationRoutes.get(
  "/find-by-user",
  authMiddleware,
  notificationController.findByUserId
);

notificationRoutes.put(
  "/update-viewed/:id",
  notificationController.updateViewed
);

export default notificationRoutes;
