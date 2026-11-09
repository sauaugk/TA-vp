const mysql = require("mysql2/promise");

const dbConf = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

const galleryPage = async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConf);
    const sql = "SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC";
    const [rows] = await conn.execute(sql, [2]);
    res.render("gallery", { photos: rows });
  } catch (err) {
    console.log(err);
    res.render("gallery", { photos: [] });
  } finally {
    if (conn) await conn.end();
  }
};

module.exports = { galleryPage };