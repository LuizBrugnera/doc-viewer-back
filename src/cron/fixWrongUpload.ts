import { documentModel } from "../models/document.model";
import userModel from "../models/user.model";

const fixUploadWrongDocuments = async () => {
  try {
    const documents = await documentModel.findAllWithUserNames();

    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      if (!document.name.includes(document.username)) {
        const userFinded = await userModel.findUserByPartialName(document.name);

        if (userFinded) {
          await documentModel.updateUserId(document.id, userFinded.id);
        }
      }
    }
  } catch (error) {
    console.error("Erro no processo de atualização dos usuários:", error);
  }
};

fixUploadWrongDocuments();
