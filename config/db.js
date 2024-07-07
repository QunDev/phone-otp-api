const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '4.213.162.142',
  user: 'quanph35528',
  password: 'Qundevauto2k4!',
  database: 'phone_otp_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = connection;
