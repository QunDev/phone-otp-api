const mysql = require('mysql');

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: '4.213.162.142',
    user: 'quanph35528',
    password: 'Qundevauto2k4!',
    database: 'phone_otp_db'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      setTimeout(handleDisconnect, 2000); // Attempt to reconnect after 2 seconds
    } else {
      console.log('Connected to MySQL');
    }
  });

  connection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;
