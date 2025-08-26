const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.AWS_DB_HOST,       // AWS RDS endpoint
  user: process.env.AWS_DB_USER,       // Master username
  password: process.env.AWS_DB_PASSWORD, // Master password
  database: process.env.AWS_DB_NAME    // Your DB name
});

db.connect((err) => {
  if (err) {
    console.error('❌ AWS DB Connection Error:', err);
  } else {
    console.log('✅ Connected to AWS RDS MySQL DB');
  }
});

module.exports = db;

module.exports = db;