import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    console.log("Checking managed_dbs for userId:", userId);

    const [rows] = await pool.query(
      "SELECT managed_dbs FROM users WHERE userId = ?",
      [userId]
    );

    console.log("Query result rows:", rows);

    const userRow = (rows as any[])[0];

    if (!userRow) {
      return res.status(404).json({ message: "User not found" });
    }

    const parsedDbs = userRow.managed_dbs;
    console.log("Parsed databases:", parsedDbs);

    // EITHER return the JS object (recommended):
    return res.status(200).json({ databases: parsedDbs });

    // OR if Thunder expects a string:
    // return res.status(200).json({ databases: JSON.stringify(parsedDbs) });

  } catch (error) {
    console.error("Error in show-dbs API:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
