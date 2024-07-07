const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.HOST || '4.213.162.142',
  user: process.env.USER || 'quanph35528',
  password: process.env.PASS || 'Qundevauto2k4!',
  database: process.env.DB || 'phone_otp_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = connection;
