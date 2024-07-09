const pool = require('../config/db');

const createOrUpdatePhone = async (req, res) => {
  try {
    const { phone, otp, status, password } = req.body;

    if (!phone) {
      console.log('Phone field is required');
      return res.status(400).json({ message: 'Phone field is required' });
    }

    const [results] = await pool.query('SELECT * FROM phone_otp WHERE phone = ?', [phone]);

    const phoneData = {
      phone,
      otp: otp || null,
      status: status || null,
      password: password || null
    };

    if (results.length > 0) {
      const existingOtp = results[0].otp || '';
      const newOtp = existingOtp ? `${existingOtp}|${otp}` : otp;

      const query = 'UPDATE phone_otp SET otp = ?, status = ?, password = ? WHERE phone = ?';
      const [updateResult] = await pool.query(query, [newOtp, phoneData.status, phoneData.password, phone]);

      console.log('Phone updated:', { phone, affectedRows: updateResult.affectedRows });
      res.json({ message: 'Phone updated', affectedRows: updateResult.affectedRows });
    } else {
      const query = 'INSERT INTO phone_otp (phone, otp, status, password) VALUES (?, ?, ?, ?)';
      const [insertResult] = await pool.query(query, [phoneData.phone, phoneData.otp, phoneData.status, phoneData.password]);

      console.log('Phone created:', { id: insertResult.insertId, ...phoneData });
      res.status(201).json({ id: insertResult.insertId, ...phoneData });
    }
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getPhones = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, phone } = req.query;
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

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [results] = await pool.query(query, params);
    console.log('Phones retrieved:', results);
    res.json(results);
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updatePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, otp, status, password } = req.body;

    if (!phone) {
      console.log('Phone field is required');
      return res.status(400).json({ message: 'Phone field is required' });
    }

    const [results] = await pool.query('SELECT * FROM phone_otp WHERE id = ?', [id]);

    if (results.length === 0) {
      console.log('Phone not found');
      return res.status(404).json({ message: 'Phone not found' });
    }

    const existingOtp = results[0].otp || '';
    const newOtp = existingOtp ? `${existingOtp}|${otp}` : otp;

    const query = 'UPDATE phone_otp SET phone = ?, otp = ?, status = ?, password = ? WHERE id = ?';
    const [updateResult] = await pool.query(query, [phone, newOtp, status, password, id]);

    console.log('Phone updated:', { id, affectedRows: updateResult.affectedRows });
    res.json({ message: 'Phone updated', affectedRows: updateResult.affectedRows });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const deletePhone = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM phone_otp WHERE id = ?';
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      console.log('Phone not found');
      return res.status(404).json({ message: 'Phone not found' });
    }

    console.log('Phone deleted:', { id });
    res.json({ message: 'Phone deleted', affectedRows: result.affectedRows });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getRecordsByHour = async (req, res) => {
  try {
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
    `;

    const [results] = await pool.query(query);
    const hourlyResults = results[0];
    const averageRecordsPerHour = results[1][0].average_records_per_hour;

    console.log('Records by hour retrieved:', { hourlyResults, averageRecordsPerHour });
    res.json({ hourlyResults, averageRecordsPerHour });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getPhoneByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      console.log('Phone parameter is required');
      return res.status(400).json({ message: 'Phone parameter is required' });
    }

    const query = 'SELECT * FROM phone_otp WHERE phone = ?';
    const [results] = await pool.query(query, [phone]);

    if (results.length === 0) {
      console.log('Phone not found');
      return res.status(404).json({ message: 'Phone not found' });
    }

    console.log('Phone retrieved:', results[0]);
    res.json(results[0]);
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { createOrUpdatePhone, getPhones, updatePhone, deletePhone, getRecordsByHour, getPhoneByPhone };
