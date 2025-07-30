import mysql from "mysql2/promise";

// export const pool = mysql.createPool({
//   host:process.env.DB_HOST,
//   port: process.env.PORT ? parseInt(process.env.PORT) : 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME   // ✅ ensure this is quickquery_auth
// });
export const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: process.env.PORT ? parseInt(process.env.PORT) : (process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT) : 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
});