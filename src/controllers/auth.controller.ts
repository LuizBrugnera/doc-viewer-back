import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model";
import {
  resetCodeMailOptions,
  resetCodes,
  resetTokens,
} from "../data/resetCodes";
import { emailHelper } from "../email/email.helper";

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, cpf, birthdate, password, confirmPassword } =
        req.body;
      if (password !== confirmPassword) {
        return res.status(400).send("As senhas não coincidem.");
      }
      const userExists = await userModel.findByEmail(email);
      if (userExists) {
        return res.status(400).send("Email já cadastrado.");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = {
        name,
        email,
        password: hashedPassword,
        role: "user",
        cpf,
        birthdate,
        department: "default",
      };
      userModel.create(user);

      res.status(201).send("Usuário registrado com sucesso!");
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao cadastrar usuário.");
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const userExists = await userModel.findByEmailWithPassword(email);
      if (!userExists) {
        return res.status(400).send("Email ou senha incorretos.");
      }

      const validPassword = await bcrypt.compare(password, userExists.password);
      if (!validPassword) {
        return res.status(400).send("Email ou senha incorretos.");
      }

      const token = jwt.sign(
        {
          email,
          name: userExists.name,
          role: userExists.role,
          id: userExists.id,
          cpf: userExists.cpf,
          rg: userExists.rg,
          cnpj: userExists.cnpj,
          birthdate: userExists.birthdate,
          phone: userExists.phone,
          cod: userExists.cod,
          department: userExists.department,
        },
        process.env.SECRET_KEY as string,
        {
          expiresIn: "12h",
        }
      );
      res.status(200).send(token);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao fazer login.");
    }
  },
  loginCnpj: async (req: Request, res: Response) => {
    try {
      const { cnpj, password } = req.body;

      const userExists = await userModel.findByCnpjWithPassword(cnpj);
      if (!userExists) {
        return res.status(400).send("CNPJ ou senha incorretos.");
      }

      const validPassword = await bcrypt.compare(password, userExists.password);
      if (!validPassword) {
        return res.status(400).send("CNPJ ou senha incorretos.");
      }

      const token = jwt.sign(
        {
          email: userExists.email,
          name: userExists.name,
          role: userExists.role,
          id: userExists.id,
          cpf: userExists.cpf,
          rg: userExists.rg,
          cnpj: userExists.cnpj,
          birthdate: userExists.birthdate,
          phone: userExists.phone,
          cod: userExists.cod,
          department: userExists.department,
        },
        process.env.SECRET_KEY as string,
        {
          expiresIn: "12h",
        }
      );
      res.status(200).send(token);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao fazer login.");
    }
  },
  loginCpf: async (req: Request, res: Response) => {
    try {
      const { cpf, password } = req.body;

      const userExists = await userModel.findByCpfWithPassword(cpf);
      if (!userExists) {
        return res.status(400).send("Cpf ou senha incorretos.");
      }

      const validPassword = await bcrypt.compare(password, userExists.password);
      if (!validPassword) {
        return res.status(400).send("Cpf ou senha incorretos.");
      }

      const token = jwt.sign(
        {
          email: userExists.email,
          name: userExists.name,
          role: userExists.role,
          id: userExists.id,
          cpf: userExists.cpf,
          rg: userExists.rg,
          cnpj: userExists.cnpj,
          birthdate: userExists.birthdate,
          phone: userExists.phone,
          cod: userExists.cod,
          department: userExists.department,
        },
        process.env.SECRET_KEY as string,
        {
          expiresIn: "12h",
        }
      );
      res.status(200).send(token);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao fazer login.");
    }
  },
  genereteCode: async (req: Request, res: Response) => {
    const { email } = req.body;

    const userExists = await userModel.findByEmail(email);
    if (!userExists) {
      return res.status(400).send("Email não cadastrado.");
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    resetCodes.set(email, { code, expiresAt });

    try {
      await emailHelper.sendMail({
        to: email,
        subject: "Password Reset Code",
        text: resetCodeMailOptions.text(code),
        html: resetCodeMailOptions.html(code),
      });

      res
        .status(200)
        .json({ message: "If the email exists, a reset code has been sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to send reset code." });
    }
  },
  verifyCode: async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;

      const resetCode = resetCodes.get(email);
      if (!resetCode || resetCode.code !== code) {
        return res.status(400).send("Invalid reset code.");
      }

      const now = new Date();
      if (now > resetCode.expiresAt) {
        return res.status(400).send("Reset code has expired.");
      }

      const token = bcrypt.hashSync(email + code, 10);

      resetTokens.set(token, {
        email,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      resetCodes.delete(email);

      res.status(200).send({ token });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao enviar código de redefinição.");
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      const resetToken = resetTokens.get(token);
      if (!resetToken) {
        return res.status(400).send("Invalid reset token.");
      }

      const now = new Date();
      if (now > resetToken.expiresAt) {
        return res.status(400).send("Reset token has expired.");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await userModel.updatePasswordByEmail(resetToken.email, hashedPassword);

      resetTokens.delete(token);

      res.status(200).send("Password reset successfully.");
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao redefinir senha.");
    }
  },

  updatePasswordWithPassword: async (req: Request, res: Response) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!req.user) {
        return res.status(400).send("User not found.");
      }

      const { id } = req.user;

      const userExists = await userModel.findById(Number(id));
      if (!userExists) {
        return res.status(400).send("User not found.");
      }

      const validPassword = await bcrypt.compare(
        oldPassword,
        userExists.password
      );
      if (!validPassword) {
        return res.status(400).send("Invalid old password.");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await userModel.updatePasswordById(Number(id), hashedPassword);

      res.status(200).send("Password updated successfully.");
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao atualizar senha.");
    }
  },
  updateDataToken: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(400).send("User not found.");
      }

      const { id, iat, exp } = req.user;

      const expiresIn = exp - iat;

      if (expiresIn < 60) {
        return res.status(400).send("Token has expired.");
      }

      const time = Math.max(1, Math.floor(expiresIn / 60 / 60));

      const user = await userModel.findById(Number(id));

      if (!user) {
        return res.status(400).send("User not found.");
      }

      const token = jwt.sign(
        {
          email: user.email,
          name: user.name,
          role: user.role,
          id: user.id,
          cpf: user.cpf,
          rg: user.rg,
          cnpj: user.cnpj,
          birthdate: user.birthdate,
          phone: user.phone,
          cod: user.cod,
          department: user.department,
        },
        process.env.SECRET_KEY as string,
        {
          expiresIn: `${time}h`,
        }
      );

      res.status(200).send({ token });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao atualizar token.");
    }
  },
};
