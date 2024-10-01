import express from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import documentRoutes from "./document.route";
import notificationRoutes from "./notification.route";
import logRoutes from "./log.route";

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/user", userRoutes);
routes.use("/document", documentRoutes);
routes.use("/notification", notificationRoutes);
routes.use("/log", logRoutes);

export default routes;
