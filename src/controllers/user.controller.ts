import { Request, Response } from "express";
import userModel from "../models/user.model";
import bcrypt from "bcryptjs";

export const userController = {
  async create(req: Request, res: Response) {
    try {
      const { name, email, role, password, department, phone } = req.body;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await userModel.create({
        name,
        email,
        password: passwordHash,
        role,
        department,
        phone,
      });

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

  async adminUpdate(req: Request, res: Response) {
    try {
      const { id, name, email, password, department, phone, role } = req.body;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await userModel.updateUser(Number(id), {
        name,
        email,
        password: passwordHash,
        department,
        phone,
        role,
      });

      return res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },

  async adminUpdateClient(req: Request, res: Response) {
    try {
      const { id, name, email, password, phone, cod, rg, cnpj } = req.body;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await userModel.updateUser(Number(id), {
        name,
        email,
        password: passwordHash,
        department: "user",
        phone,
        role: "user",
        cod,
        rg,
        cnpj,
      });

      return res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso" });
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

  async findAllUserDepartaments(req: Request, res: Response) {
    try {
      const departments = await userModel.findAllUserDepartaments();
      return res.status(200).json(departments);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  },
};
