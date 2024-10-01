interface UserAuth {
  id: number;
  email: string;
  cnpj: string;
  cpf: string;
  cod: string;
  department: string;
  role: string;
  iat: number;
  exp: number;
}
declare namespace Express {
  interface Request {
    user?: UserAuth;
    uuidFile?: string;
    originalFilename?: string;
    documentUserId?: number;
  }
}
