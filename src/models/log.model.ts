import pool from "../database/db";
import { formatDateToMySQL } from "../util/util.global";

interface LogCreate {
  action: string;
  description: string;
  userId: number;
}

interface LogOutput {
  id: number;
  action: string;
  description: string;
  userId: number;
  date: string;
}

export const logModel = {
  create: async ({
    action,
    description,
    userId,
  }: LogCreate): Promise<LogOutput> => {
    const date = formatDateToMySQL(new Date());

    const [result] = await pool.query(
      "INSERT INTO logs ( action, description, date, userId) VALUES (?, ?, ?, ?)",
      [action, description, date, userId]
    );

    const id = (result as any).insertId;
    return { id, action, description, userId, date };
  },
  delete: async (id: number): Promise<void> => {
    await pool.query("DELETE FROM logs WHERE id = ?", [id]);
  },
  findByUserId: async (userId: number): Promise<LogOutput[]> => {
    const [result] = await pool.query(
      "SELECT * FROM logs WHERE userId = ? ORDER BY date DESC",
      [userId]
    );

    return result as any;
  },
};
