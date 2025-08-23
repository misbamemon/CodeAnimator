const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST,       // Railway MySQL host
  user: process.env.DB_USER,       // Railway MySQL user
  password: process.env.DB_PASSWORD, // Railway MySQL password
  database: process.env.DB_NAME    // Railway MySQL database name
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
  } else {
    console.log('✅ Connected to Railway MySQL DB');
  }
});

module.exports = db;
