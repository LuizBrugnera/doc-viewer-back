import { Request, Response, NextFunction } from "express";

export const roleAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
  rolesAllowed: string[]
) => {
  try {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).send("Acesso negado.");
    }

    if (!rolesAllowed.includes(role)) {
      return res.status(403).send("Acesso negado.");
    }

    next();
  } catch (error) {
    res.status(400).send("Token inválido.");
  }
};
