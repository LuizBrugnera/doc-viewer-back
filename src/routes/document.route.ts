import express from "express";
import { documentController } from "../controllers/document.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/document.middleware";
import { fastupload } from "../middlewares/fastUpload.middleware";
import { roleAuthMiddleware } from "../middlewares/roleAuth.middleware";

const documentRoutes = express.Router();

documentRoutes.get(
  "/download-file/:documentId/:userId?",
  authMiddleware,
  documentController.downloadDocument
);

documentRoutes.post(
  "/upload-file/:userId",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin", "department"]);
  },
  upload.single("document"),
  documentController.uploadDocument
);

documentRoutes.post(
  "/upload-file-fast",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin", "department"]);
  },
  fastupload.single("document"),
  documentController.fastUploadDocument
);

documentRoutes.get(
  "/get-files-by-user",
  authMiddleware,
  documentController.findDocumentsByUser
);

documentRoutes.get(
  "/get-files-by-user-department",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin", "department"]);
  },
  documentController.findDocumentsByUserDepartment
);

documentRoutes.delete(
  "/delete-file/:documentId",
  authMiddleware,
  (req, res, next) => {
    roleAuthMiddleware(req, res, next, ["admin", "department"]);
  },
  documentController.deleteDocument
);

documentRoutes.get(
  "/get-files-by-user-with-folder-format",
  authMiddleware,
  documentController.findDocumentsByUserIdFolderFormat
);

export default documentRoutes;
