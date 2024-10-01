import { Request, Response } from "express";
import userModel from "../models/user.model";

export const userController = {
  async create(req: Request, res: Response) {
    try {
      console.log(userModel.findAll());
      const user = await userModel.create(req.body);

      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const users = await userModel.findAll;
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const user = await userModel.findById(Number(req.params.id));
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.user?.id;

      if (!id) {
        return res.status(400).json({ error: "User not found" });
      }

      const user = await userModel.updateUserInfo(Number(id), req.body);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await userModel.delete(Number(req.params.id));
      return res.status(204).json();
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },

  async findUsersByDepartment(req: Request, res: Response) {
    try {
      const department = req.user?.department;

      if (!department) {
        return res.status(400).json({ error: "Department not found" });
      }

      const users = await userModel.findUsersByDepartment(department);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },
};
