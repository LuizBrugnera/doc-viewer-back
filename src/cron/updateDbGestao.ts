import axios from "axios";
import dotenv from "dotenv";
import userModel from "../models/user.model";
import * as fs from "fs";
import bcrypt from "bcryptjs";

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

          if (!razao_social) {
            contadorDeErros++;
            //console.log(
            //  `Usuário com id ${id} não possui nome razao social válido.`
            //);

            messageWithOutName += ` Usuário com id ${id} nome ${cnpj} não possui nome válido.\n`;
            return;
          }
          let password = "";

          if (!cnpj) {
            if (cpf) {
              password = cpf.replace(".", "").replace(".", "").slice(0, 8);
            } else {
              contadorDeErros++;
              console.log(
                `Usuário com id ${id} não possui CPF ou CNPJ válido.`
              );
              return;
            }
          } else {
            password = cnpj.replace(".", "").replace(".", "").slice(0, 8);
          }

          if (!email) {
            email = password + "@example.com";
          }

          try {
            const userExists = await userModel.findByEmail(email);
            if (!userExists) {
              console.log("Criando usuário " + contadorDeUsers);
              contadorDeUsers++;
              const salt = await bcrypt.genSalt(10);
              const hashPassword = await bcrypt.hash(password, salt);
              await userModel.create({
                name: razao_social,
                cod: id,
                email,
                cpf,
                rg,
                department: "user",
                role: "user",
                cnpj: cnpj,
                password: hashPassword,
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

    // logErrorToFile("sem_nome_valido.txt", messageWithOutName);

    return;
  } catch (error) {
    console.error("Erro no processo de atualização dos usuários:", error);
  }
};

updateUsersDbWithGestao();
