import pool from "../database/db";

interface DocumentCreate {
  name: string;
  type: string;
  description: string;
  date: string;
  userId: number;
  uuid: string;
  folder: string;
}

interface DocumentOutput {
  id: number;
  name: string;
  type: string;
  description: string;
  date: string;
  userId: number;
  uuid: string;
  folder: string;
}

export const documentModel = {
  create: async ({
    name,
    type,
    description,
    date,
    userId,
    uuid,
    folder,
  }: DocumentCreate): Promise<DocumentOutput> => {
    const [result] = await pool.query(
      "INSERT INTO documents (name, type, description, date, uuid, userId, folder) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, type, description, date, uuid, userId, folder]
    );

    const id = (result as any).insertId;
    return { id, name, type, description, date, userId, uuid, folder };
  },
  findByUserId: async (userId: number): Promise<DocumentOutput[]> => {
    const [result] = await pool.query(
      "SELECT * FROM documents WHERE userId = ? ORDER BY date DESC",
      [userId]
    );

    return result as any;
  },
  delete: async (id: number): Promise<void> => {
    await pool.query("DELETE FROM documents WHERE id = ?", [id]);
  },
  findById: async (id: number): Promise<DocumentOutput | null> => {
    const [result] = await pool.query("SELECT * FROM documents WHERE id = ?", [
      id,
    ]);

    return (result as any)[0] || null;
  },

  findDocumentsByUserDepartment: async (
    department: string
  ): Promise<DocumentOutput[]> => {
    const queries = {
      financeiro: `
        SELECT * FROM documents WHERE  (folder = "boletos" or folder = "recibos" or folder = "notasFiscais" or folder = "contratos" or folder = "ordensServico") ORDER BY date DESC;
      `,
      documentosTecnicos: `
        SELECT * FROM documents WHERE  
        (folder = "laudosPCMSO" or folder = "laudosPGR" or folder = "laudosLTCAT" or folder = "laudosDiversos") ORDER BY date DESC;
      `,
      faturamento: `
        SELECT * FROM documents WHERE  folder = "relatorioFaturamento" ORDER BY date DESC;
      `,
      esocial: `
        SELECT * FROM documents WHERE  
        (folder = "relatorioEventoS-2240" or folder = "relatorioEventoS-2220" or folder = "relatorioEventoS-2210") ORDER BY date DESC;
      `,
      vendas: `
        SELECT * FROM documents WHERE  
        (folder = "contratos" or folder = "ordensServico") ORDER BY date DESC;
      `,
    } as { [key: string]: string };

    const query = queries[department];
    if (!query) {
      return [];
    }

    const [result] = await pool.query(query);
    return result as any;
  },
  findDocumentsByUserIdAndFolder: async (
    userId: number,
    folder: string
  ): Promise<DocumentOutput[]> => {
    const [result] = await pool.query(
      "SELECT * FROM documents WHERE userId = ? AND folder = ? ORDER BY date DESC",
      [userId, folder]
    );
    return result as any;
  },
};
