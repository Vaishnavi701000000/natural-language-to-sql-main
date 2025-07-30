import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, db_name } = req.body;

  if (!userId || !db_name) {
    return res.status(400).json({ message: "Missing userId or db_name" });
  }

  try {
    // get the current managed_dbs
    const [rows] = await pool.query(
      "SELECT managed_dbs FROM users WHERE userId = ?",
      [userId]
    );

    const userRow = (rows as any[])[0];

    if (!userRow) {
      return res.status(404).json({ message: "User not found" });
    }

    const managedDbs = userRow.managed_dbs as any[];

    // update isActive flags
    const updatedDbs = managedDbs.map((db: any) => ({
      ...db,
      isActive: db.db_name === db_name, // only activate this db
    }));

    // store back
    await pool.query(
      "UPDATE users SET managed_dbs = ? WHERE userId = ?",
      [JSON.stringify(updatedDbs), userId]
    );

    return res.status(200).json({ message: `Database ${db_name} activated successfully` });
  } catch (error) {
    console.error("Error in activate-db API:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
