const mysql = require('mysql');

let pool;

function createPool() {
  pool = mysql.createPool({
    connectionLimit: 10, // Tùy chỉnh số lượng kết nối tối đa
    host: '74.225.136.162',
    user: 'quanph35528',
    password: 'Qundevauto2k4!',
    database: 'phone_otp_db',
    multipleStatements: true,
    connectTimeout: 10000, // Thời gian chờ kết nối (10 giây)
    acquireTimeout: 10000, // Thời gian chờ nhận kết nối (10 giây)
  });

  pool.on('connection', (connection) => {
    console.log('New connection established with MySQL');
  });

  pool.on('acquire', (connection) => {
    console.log('Connection %d acquired', connection.threadId);
  });

  pool.on('release', (connection) => {
    console.log('Connection %d released', connection.threadId);
  });

  pool.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

function handleDisconnect() {
  try {
    if (pool) {
      pool.end((err) => {
        if (err) {
          console.error('Error ending the pool:', err);
        }
        createPool();
      });
    } else {
      createPool();
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    setTimeout(handleDisconnect, 2000); // Thử lại kết nối sau 2 giây
  }
}

handleDisconnect();

module.exports = pool;
