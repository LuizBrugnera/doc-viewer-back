import { Request, Response } from "express";
import { logModel } from "../models/log.model";

export const logController = {
  create: async (req: Request, res: Response) => {
    const { action, description, userId } = req.body;

    if (!action) {
      return res.status(400).send("Ação não informada");
    }

    if (!description) {
      return res.status(400).send("Descrição não informada");
    }

    if (!userId) {
      return res.status(400).send("Usuário não encontrado");
    }

    const log = await logModel.create({
      action,
      description,
      userId: Number(userId),
    });

    res.status(201).send(log);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await logModel.delete(Number(id));
    res.status(204).send();
  },
  findByUserId: async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).send("Usuário não encontrado");
    }
    const logs = await logModel.findByUserId(Number(userId));
    res.status(200).send(logs);
  },
};
