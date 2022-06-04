const sql = require("mssql");
const request = new sql.Request();
var env = require("dotenv").config();
const crew_ws = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PW,
  database: "crew_ws-2022-6-3-20-3",
  server: "pb-sandbox-sql.database.windows.net",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

async function getAllUsers() {
  try {
    await sql.connect(crew_ws);
    const result = await sql.query`SELECT * FROM Users;`;
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function getLicenceAssignments() {
  try {
    await sql.connect(crew_ws);
    const result = await sql.query`SELECT * FROM LicensedBundles;`;
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function insertUser(firstName, lastName) {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("LastName", sql.VarChar(255), lastName)
      .input("FirstName", sql.VarChar(255), firstName)
      .output()
      .execute("insertnewuser");

    return result;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getAllUsers,
  insertUser,
  getLicenceAssignments,
};
