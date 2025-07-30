// /lib/getActiveDatabase.ts

import { pool } from "./db";
import type { RowDataPacket } from "mysql2";

export async function getActiveDatabase(userId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT managed_dbs FROM users WHERE userId = ?",
      [userId]
    );

    if (!rows || rows.length === 0) return null;

    // managed_dbs JSON is automatically parsed by MySQL
    const managedDbs = rows[0].managed_dbs;

    // find the active one
    const activeDb = managedDbs.find((db: any) => db.isActive);

    return activeDb || null;
  } catch (err) {
    console.error("getActiveDatabase error", err);
    return null;
  }
}
