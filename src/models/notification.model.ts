import pool from "../database/db";
import { formatDateToMySQL } from "../util/util.global";

interface NotificationCreate {
  title: string;
  description: string;
  userId: number;
}

interface NotificationOutput {
  id: number;
  title: string;
  description: string;
  userId: number;
  viewed: boolean;
}

export const notificationModel = {
  create: async ({
    title,
    description,
    userId,
  }: NotificationCreate): Promise<NotificationOutput> => {
    const date = formatDateToMySQL(new Date());

    const [result] = await pool.query(
      "INSERT INTO notifications (title, description, date, userId) VALUES (?, ?, ?, ?)",
      [title, description, date, userId]
    );

    const id = (result as any).insertId;
    return { id, title, description, userId, viewed: false };
  },
  updateViewed: async (id: number): Promise<void> => {
    await pool.query("UPDATE notifications SET viewed = 1 WHERE id = ?", [id]);
  },
  delete: async (id: number): Promise<void> => {
    await pool.query("DELETE FROM notifications WHERE id = ?", [id]);
  },
  findByUserId: async (userId: number): Promise<NotificationOutput[]> => {
    const [result] = await pool.query(
      "SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC",
      [userId]
    );

    return result as any;
  },
};
