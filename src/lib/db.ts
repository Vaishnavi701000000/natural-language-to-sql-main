import mysql from "mysql2/promise";

export const configPool = mysql.createPool({
  host:process.env.DB_HOST,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME   // ✅ ensure this is quickquery_auth
});
