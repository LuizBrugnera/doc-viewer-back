import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { documentModel } from "../models/document.model";
import { notificationModel } from "../models/notification.model";
import { formatDateToDDMMYYYY, formatDateToMySQL } from "../util/util.global";
import userModel from "../models/user.model";
import { logModel } from "../models/log.model";

export const documentController = {
  async downloadDocument(req: Request, res: Response) {
    try {
      const userId =
        req.user?.role === "user" ? req.user?.id : req.params.userId;
      const documentId = req.params.documentId;

      const document = await documentModel.findById(Number(documentId));
      if (!document) {
        return res.status(404).send("Documento não encontrado");
      }

      if (!userId) {
        return res.status(400).send("Usuário não encontrado");
      }
      const type = document.uuid.split(".").pop();
      const filePath = path.join(
        __dirname,
        `../../documents/${userId}/${document.uuid}`
      );
      //const safeBasePath = path.join(__dirname, `../../documents/${userId}`);
      //const safeFilePath = path.normalize(filePath);
      /* 
      if (!safeFilePath.startsWith(safeBasePath)) {
          return res.status(400).send('Caminho de arquivo inválido');
      }
      */

      // Verifica se o arquivo existe
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return res.status(404).send("Arquivo não encontrado");
        } else {
          // Obtem o tipo MIME dinamicamente com base na extensão do arquivo
          const mimeType =
            mime.lookup(`${document.name}${type ? `.${type}` : ""}`) ||
            "application/octet-stream";

          res.setHeader("Content-Type", mimeType);
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${document.name}${type ? `.${type}` : ""}"`
          );

          res.sendFile(filePath);
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao baixar documento");
    }
  },
  async uploadDocument(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, type, description, folder } = req.body;
      const file = req.file;
      const uuid = req.uuidFile;

      if (!uuid) {
        return res.status(400).send("Usuário não encontrado");
      }

      if (!file) {
        return res.status(400).send("Nenhum arquivo enviado");
      }

      const date = formatDateToMySQL(new Date());

      await documentModel.create({
        name,
        type,
        description,
        date,
        userId: Number(userId),
        uuid,
        folder,
      });

      await notificationModel.create({
        title: "Novo documento disponivel",
        userId: Number(userId),
        description: `Novo documento ${name} recebido e pronto para download`,
      });

      await logModel.create({
        action: "Documento adicionado",
        description: `Novo documento ${name} adicionado e pronto para download`,
        userId: Number(req.user?.id),
      });

      res
        .status(200)
        .send(
          `Arquivo ${file.originalname} salvo com sucesso para o usuário ${userId}`
        );
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao fazer upload do arquivo");
    }
  },

  async uploadDocuments(req: Request, res: Response) {
    try {
      const userId = 1;
      const { name, type, description, folder } = req.body;
      const file = req.file;
      const uuid = req.uuidFile;

      const folderToFolderFormat = {
        boletos: "Boletos",
        notasFiscais: "Notas Fiscais",
        recibos: "Recibos",
        laudosPCMSO: "Laudos PCMSO",
        laudosPGR: "Laudos PGR",
        laudosLTCAT: "Laudos LTCAT",
        laudosDiversos: "Laudos Diversos",
        relatorioFaturamento: "Relatório de Faturamento",
        relatorioEventoS2240: "Relatório Evento S-2240",
        relatorioEventoS2220: "Relatório Evento S-2220",
        relatorioEventoS2210: "Relatório Evento S-2210",
        contratos: "Contratos",
        ordensServico: "Ordens de Serviço",
      } as { [key: string]: string };

      if (!uuid) {
        return res.status(400).send("Usuário não encontrado");
      }

      if (!file) {
        return res.status(400).send("Nenhum arquivo enviado");
      }

      const date = formatDateToMySQL(new Date());

      await documentModel.create({
        name,
        type,
        description,
        date,
        userId: Number(userId),
        uuid,
        folder,
      });

      await notificationModel.create({
        title: "Novo documento disponivel",
        userId: Number(userId),
        description: `Novo documento ${name} na pasta ${folderToFolderFormat[folder]} recebido e pronto para download`,
      });

      await logModel.create({
        action: "Documento adicionado",
        description: `Novo documento ${name} adicionado e pronto para download`,
        userId: Number(req.user?.id),
      });

      res
        .status(200)
        .send(
          `Arquivo ${file.originalname} salvo com sucesso para o usuário ${userId}`
        );
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao fazer upload do arquivo");
    }
  },

  findDocumentsByUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).send("Usuário não encontrado");
      }

      documentModel.findByUserId(userId).then((documents) => {
        res.status(200).send(documents);
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao buscar documentos");
    }
  },

  findDocumentsByUserDepartment(req: Request, res: Response) {
    try {
      const department = req.user?.department;

      if (!department) {
        return res.status(400).send("Empresa não encontrada");
      }

      documentModel
        .findDocumentsByUserDepartment(department)
        .then((documents) => {
          res.status(200).send(documents);
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao buscar documentos");
    }
  },

  async deleteDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const documentId = req.params.documentId;

      if (!userId) {
        return res.status(400).send("Usuário não encontrado");
      }

      const document = await documentModel.findById(Number(documentId));

      const userDocument = await userModel.findById(Number(userId));

      if (!document) {
        return res.status(404).send("Documento não encontrado");
      }

      if (userDocument) {
        if (
          !(
            document.userId === userId ||
            req.user?.role === "admin" ||
            (req.user?.role === "department" &&
              req.user?.department === userDocument.department)
          )
        ) {
          return res.status(403).send("Usuário não autorizado");
        }
      }

      const filePath = path.join(
        __dirname,
        `../../documents/${document.userId}/${document.uuid}`
      );

      try {
        await fs.promises.access(filePath, fs.constants.F_OK);

        await fs.promises.unlink(filePath);
        console.log(`Arquivo ${filePath} excluído com sucesso.`);
      } catch (err) {
        console.error(`Erro ao excluir o arquivo ${filePath}:`, err);
        throw new Error("Erro ao excluir o arquivo");
      }

      await documentModel.delete(Number(documentId));

      await logModel.create({
        action: "Documento excluído",
        description: `Documento ${documentId} excluído com sucesso`,
        userId: Number(req.user?.id),
      });

      res.status(204).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao excluir documento");
    }
  },

  async findDocumentsByUserIdAndFolder(req: Request, res: Response) {
    const userId = req.user?.id;
    const folder = req.params.folder;

    if (!userId) {
      return res.status(400).send("Usuário não encontrado");
    }

    const documents = await documentModel.findDocumentsByUserIdAndFolder(
      Number(userId),
      folder
    );
    res.status(200).send(documents);
    console.log(documents);
  },

  async findDocumentsByUserIdFolderFormat(req: Request, res: Response) {
    const userId = req.user?.id || 0;
    const folders = [
      "boletos",
      "notasFiscais",
      "recibos",
      "laudosPCMSO",
      "laudosPGR",
      "laudosLTCAT",
      "laudosDiversos",
      "relatorioFaturamento",
      "relatorioEventoS2240",
      "relatorioEventoS2220",
      "relatorioEventoS2210",
      "contratos",
      "ordensServico",
    ];

    const folderToFolderFormat = {
      boletos: "Boletos",
      notasFiscais: "Notas Fiscais",
      recibos: "Recibos",
      laudosPCMSO: "Laudos PCMSO",
      laudosPGR: "Laudos PGR",
      laudosLTCAT: "Laudos LTCAT",
      laudosDiversos: "Laudos Diversos",
      relatorioFaturamento: "Relatório de Faturamento",
      relatorioEventoS2240: "Relatório Evento S-2240",
      relatorioEventoS2220: "Relatório Evento S-2220",
      relatorioEventoS2210: "Relatório Evento S-2210",
      contratos: "Contratos",
      ordensServico: "Ordens de Serviço",
    } as { [key: string]: string };

    const folderFormat = [
      {
        name: "Financeiro",
        contents: [
          {
            name: "Boletos",
            resource: "folder",
            contents: [],
          },
          {
            name: "Notas Fiscais",
            resource: "folder",
            contents: [],
          },
          {
            name: "Recibos",
            resource: "folder",
            contents: [],
          },
        ],
      },
      {
        name: "Documentos tecnicos",
        contents: [
          {
            name: "Laudos PCMSO",
            resource: "folder",
            contents: [],
          },
          { name: "Laudos PGR", resource: "folder", contents: [] },
          { name: "Laudos LTCAT", resource: "folder", contents: [] },
          { name: "Laudos Diversos", resource: "folder", contents: [] },
        ],
      },
      {
        name: "Exames",
        contents: [
          {
            name: "Exames Laboratoriais",
            resource: "folder",
            contents: [],
          },
          {
            name: "Exames Telecardio",
            resource: "folder",
            contents: [],
          },
          {
            name: "Exames Local",
            resource: "folder",
            contents: [],
          },
          {
            name: "Exames Proclinic (Audiometria)",
            resource: "folder",
            contents: [],
          },
          {
            name: "Exames Proclinic (Aso)",
            resource: "folder",
            contents: [],
          },
        ],
      },
      {
        name: "Faturamento",
        contents: [
          {
            name: "Relatório de Faturamento",
            resource: "folder",
            contents: [],
          },
        ],
      },
      {
        name: "E-social",
        contents: [
          { name: "Relatório Evento S-2240", resource: "folder", contents: [] },
          { name: "Relatório Evento S-2220", resource: "folder", contents: [] },
          { name: "Relatório Evento S-2210", resource: "folder", contents: [] },
        ],
      },
      {
        name: "Vendas",
        contents: [
          { name: "Contratos", resource: "folder", contents: [] },
          { name: "Ordens de Serviço", resource: "folder", contents: [] },
        ],
      },
    ];

    if (!userId) {
      return res.status(400).send("Usuário não encontrado");
    }

    try {
      const documents = await Promise.all(
        folders.map(async (folder) => {
          const docs = await documentModel.findDocumentsByUserIdAndFolder(
            Number(userId),
            folder
          );
          return { folder, docs };
        })
      );

      const insertDocumentsInFolder = (
        folderName: string,
        docs: any[],
        folderFormat: any[]
      ) => {
        for (const folder of folderFormat) {
          if (folder.contents) {
            for (const content of folder.contents) {
              if (content.name === folderToFolderFormat[folderName]) {
                content.contents = docs;
                return true;
              } else if (
                content.contents.length > 0 &&
                content.resource === "folder"
              ) {
                if (
                  insertDocumentsInFolder(folderName, docs, content.contents)
                ) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      };

      documents.forEach(({ folder, docs }) => {
        insertDocumentsInFolder(folder, docs, folderFormat);
      });
      res.status(200).send(folderFormat);
    } catch (error) {
      res.status(500).send("Erro ao buscar documentos");
    }
  },

  async fastUploadDocument(req: Request, res: Response) {
    try {
      const { name, type, description, folder } = req.body;
      const file = req.file;
      const uuid = req.uuidFile;
      const userId = req.documentUserId;

      const folderToFolderFormat = {
        boletos: "Boletos",
        notasFiscais: "Notas Fiscais",
        recibos: "Recibos",
        laudosPCMSO: "Laudos PCMSO",
        laudosPGR: "Laudos PGR",
        laudosLTCAT: "Laudos LTCAT",
        laudosDiversos: "Laudos Diversos",
        relatorioFaturamento: "Relatório de Faturamento",
        relatorioEventoS2240: "Relatório Evento S-2240",
        relatorioEventoS2220: "Relatório Evento S-2220",
        relatorioEventoS2210: "Relatório Evento S-2210",
        contratos: "Contratos",
        ordensServico: "Ordens de Serviço",
      } as { [key: string]: string };

      const folderToSmallFormat = {
        boletos: "Boleto",
        notasFiscais: "Nota Fiscal",
        recibos: "Recibo",
        laudosPCMSO: "Laudo PCMSO",
        laudosPGR: "Laudo PGR",
        laudosLTCAT: "Laudo LTCAT",
        laudosDiversos: "Laudo Diverso",
        relatorioFaturamento: "Faturamento",
        relatorioEventoS2240: "Evento S-2240",
        relatorioEventoS2220: "Evento S-2220",
        relatorioEventoS2210: "Evento S-2210",
        contratos: "Contrato",
        ordensServico: "Ordem de Serviço",
      } as { [key: string]: string };

      const invertObject = (obj: { [key: string]: string }) => {
        const invertedObj: { [key: string]: string } = {};

        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            invertedObj[obj[key]] = key;
          }
        }

        return invertedObj;
      };

      const invertedFolderFormat = invertObject(folderToFolderFormat);

      const folderInFolderFormat = invertedFolderFormat[folder];

      if (!file) {
        return res.status(400).send("Nenhum arquivo enviado");
      }

      if (!userId) {
        return res.status(400).send("Usuário não encontrado");
      }

      if (!uuid) {
        return res.status(400).send("Usuário não encontrado");
      }

      const date = formatDateToMySQL(new Date());

      await documentModel.create({
        name: `${folderToSmallFormat[folderInFolderFormat]} - ${
          name.split(".")[0]
        } - ${formatDateToDDMMYYYY(date)}.${type}`,
        type,
        description,
        date,
        userId: Number(userId),
        uuid,
        folder: folderInFolderFormat,
      });

      await notificationModel.create({
        title: "Novo documento disponivel",
        userId: Number(userId),
        description: `Novo documento ${name} na pasta ${folder} recebido e pronto para download`,
      });

      await logModel.create({
        action: "Documento adicionado",
        description: `Novo documento ${name} na pasta ${folder} adicionado e pronto para download`,
        userId: Number(req.user?.id),
      });

      res
        .status(200)
        .send(
          `Arquivo ${file.originalname} salvo com sucesso para o usuário ${userId}`
        );
    } catch (error) {
      console.log(error);
      return res.status(500).send("Erro ao fazer upload do arquivo");
    }
  },
};
