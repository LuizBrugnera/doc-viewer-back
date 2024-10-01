import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send("Acesso negado.");
  }

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY as string);
    const { id, email, cpf, cnpj, cod, iat, exp, department, role } =
      verified as {
        id: string;
        email: string;
        cpf: string;
        cnpj: string;
        cod: string;
        iat: number;
        exp: number;
        department: string;
        role: string;
      };
    req.user = {
      id: +id,
      email,
      cpf,
      cnpj,
      iat: +iat,
      exp: +exp,
      cod,
      department,
      role,
    };
    next();
  } catch (error) {
    res.status(400).send("Token inválido.");
  }
};
