// pages/api/manage/create-db.ts
import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import { pool } from '@/lib/db'; // main pool for quickquery_auth

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, db_name } = req.body;

  if (!userId || !db_name ) {
    return res.status(400).json({ message: "Missing details to create database." });
  }

  try {
    // 1. Create database if it doesn't exist on the target host
    const tempConn = await mysql.createConnection({
      host:process.env.DB_HOST,
      port: process.env.PORT ? parseInt(process.env.PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ,
      multipleStatements: true,
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\` CHARACTER SET utf8mb4`);
    await tempConn.end();

    // 2. Update user's managed_dbs in quickquery_auth
    // Get current managed_dbs
    // const [rows] = await pool.query(
    //   'SELECT managed_dbs FROM users WHERE userId = ?',
    //   [userId]
    // );
    // let managedDbs = [];
    // if (rows.length && rows[0].managed_dbs) {
    //   managedDbs = typeof rows[0].managed_dbs === 'string'
    //     ? JSON.parse(rows[0].managed_dbs)
    //     : rows[0].managed_dbs;
    // }
    const [rows] = await pool.query<any[]>(
  'SELECT managed_dbs FROM users WHERE userId = ?',
  [userId]
);

let managedDbs: any[] = [];
if (Array.isArray(rows) && rows.length > 0 && rows[0].managed_dbs) {
  if (typeof rows[0].managed_dbs === 'string') {
    try {
      managedDbs = JSON.parse(rows[0].managed_dbs);
    } catch {
      managedDbs = [];
    }
  } else {
    managedDbs = rows[0].managed_dbs;
  }
}


    // 3. Add new DB entry
    managedDbs.push({
      host:process.env.DB_HOST,
      port: process.env.PORT ? parseInt(process.env.PORT) : 3306,
      db_name: db_name,
      db_username: process.env.DB_USER,
      db_password: process.env.DB_PASSWORD,
      isActive: false,
    });

    // 4. Update user's managed_dbs column
    await pool.query(
      'UPDATE users SET managed_dbs = ? WHERE userId = ?',
      [JSON.stringify(managedDbs), userId]
    );

    return res.status(201).json({ message: 'Database created and added to managed_dbs.' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}
