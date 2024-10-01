import { Request, Response } from "express";
import { notificationModel } from "../models/notification.model";

export const notificationController = {
  updateViewed: async (req: Request, res: Response) => {
    const { id } = req.params;
    await notificationModel.updateViewed(Number(id));
    res.status(200).send("Notificação visualizada com sucesso!");
  },
  findByUserId: async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).send("Usuário não encontrado");
    }
    const notifications = await notificationModel.findByUserId(Number(userId));
    res.status(200).send(notifications);
  },
};
