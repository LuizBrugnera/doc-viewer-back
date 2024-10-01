import multer from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import userModel from "../models/user.model";

function getFileNameWithoutExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return fileName;
  }
  return fileName.substring(0, lastDotIndex);
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const filenameWithoutExtension = getFileNameWithoutExtension(
      file.originalname
    );
    const user = await userModel.findUserByName(filenameWithoutExtension);

    if (!user) {
      req.documentUserId = 0;
    }

    req.documentUserId = user?.id;

    const userDir = path.join(__dirname, `../../documents/${user?.id}`);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const tempFilename = uuidv4();
    const type = file.originalname.split(".").pop();
    const filename = `${tempFilename}${type ? `.${type}` : ""}`;
    req.uuidFile = filename;
    req.originalFilename = file.originalname;
    req.body.type = type;
    cb(null, filename);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado"));
  }
};

export const fastupload = multer({ storage, fileFilter });
