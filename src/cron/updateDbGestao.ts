import axios from "axios";
import dotenv from "dotenv";
import userModel from "../models/user.model";
import * as fs from "fs";

dotenv.config();

const API_URL = process.env.API_GESTAO_URL;
const API_TOKEN = process.env.API_GESTAO_TOKEN;
const API_SECRET = process.env.API_GESTAO_SECRET;

const logErrorToFile = (filename: string, message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;

  try {
    fs.appendFileSync(filename, logMessage + "\n", { flag: "a" });
  } catch (err) {
    console.error("Erro ao escrever no arquivo de log:", err);
  }
};

const updateUsersDbWithGestao = async () => {
  try {
    const initialResponse = await axios.get(`${API_URL}${1}`, {
      headers: {
        "access-token": API_TOKEN,
        "secret-access-token": API_SECRET,
      },
    });

    const pages = initialResponse.data.meta.total_paginas;
    let contadorDeUsers = 0;
    let contadorDeErros = 0;
    let messageWithOutCnpj = "";
    let messageWithOutEmail = "";
    let messageWithOutName = "";
    for (let i = 1; i <= pages; i++) {
      console.log("Processando página " + i);
      let pageResponse;

      try {
        pageResponse = await axios.get(`${API_URL}${i}`, {
          headers: {
            "access-token": API_TOKEN,
            "secret-access-token": API_SECRET,
          },
        });
      } catch (error) {
        console.error(`Erro ao buscar usuários na página ${i}:`, error);
        continue;
      }

      const users = pageResponse.data.data;

      const userPromises = users.map(
        async (user: {
          id: any;
          razao_social: any;
          email: any;
          cpf: any;
          rg: any;
          cnpj: any;
          celular: any;
          data_nascimento: any;
        }) => {
          let {
            id,
            razao_social,
            email,
            cpf,
            rg,
            cnpj,
            celular,
            data_nascimento,
          } = user;

          if (!cnpj) {
            contadorDeErros++;
            console.log(`Usuário com id ${id} não possui cnpj válido.`);
            console.log({
              id,
              razao_social,
              email,
              cpf,
              rg,
              cnpj,
              celular,
            });
            messageWithOutCnpj += ` Usuário com id ${id} nome ${razao_social} não possui cnpj válido.\n`;
            return;
          }

          if (!email) {
            contadorDeErros++;
            console.log(`Usuário com id ${id} não possui email válido.`);
            console.log({
              id,
              razao_social,
              email,
              cpf,
              rg,
              cnpj,
              celular,
            });
            messageWithOutEmail += ` Usuário com id ${id} nome ${razao_social} não possui email válido.\n`;
            return;
          }

          if (!razao_social) {
            contadorDeErros++;
            console.log(
              `Usuário com id ${id} não possui nome razao social válido.`
            );
            console.log({
              id,
              razao_social,
              email,
              cpf,
              rg,
              cnpj,
              celular,
            });
            messageWithOutName += ` Usuário com id ${id} nome ${cnpj} não possui nome válido.\n`;
            return;
          }

          const password = cnpj.replace(".", "").replace(".", "").slice(0, 8);

          if (!email) {
            email = password + "@example.com";
          }

          try {
            const userExists = await userModel.findByEmail(email);
            if (!userExists) {
              console.log("Criando usuário " + contadorDeUsers);
              contadorDeUsers++;
              await userModel.create({
                name: razao_social,
                cod: id,
                email,
                cpf,
                rg,
                department: "user",
                role: "user",
                cnpj: cnpj,
                password,
                birthdate: data_nascimento,
                phone: celular,
              });
            }
          } catch (error) {
            console.error(`Erro ao criar usuário com email ${email}:`, error);
          }
        }
      );

      await Promise.all(userPromises);
    }

    console.log(
      "Processo finalizado. Total de usuários criados:",
      contadorDeUsers
    );
    console.log(
      "Processo finalizado. Total de usuários criados:",
      contadorDeErros
    );

    logErrorToFile("sem_cnpj.txt", messageWithOutCnpj);
    logErrorToFile("sem_email.txt", messageWithOutEmail);
    logErrorToFile("sem_nome_valido.txt", messageWithOutName);

    return;
  } catch (error) {
    console.error("Erro no processo de atualização dos usuários:", error);
  }
};

updateUsersDbWithGestao();
