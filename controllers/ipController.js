const pool = require('../config/db');

const createIP = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { ip, status, date } = req.body;

    if (!ip) {
      console.log('IP field is required');
      return res.status(400).json({ message: 'IP field is required' });
    }

    const ipData = { ip, status: status || null, date: date || null };

    const query = 'INSERT INTO ip_addresses (ip, status, date) VALUES (?, ?, ?)';
    const [result] = await connection.query(query, [ipData.ip, ipData.status, ipData.date]);

    console.log('IP created:', { id: result.insertId, ...ipData });
    res.status(201).json({ id: result.insertId, ...ipData });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const getIPs = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { page = 1, limit = 10, status, ip } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM ip_addresses';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    if (ip) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' ip = ?';
      params.push(ip);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [results] = await connection.query(query, params);
    console.log('IPs retrieved:', results);
    res.json(results);
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const updateIP = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const { ip, status, date } = req.body;

    if (!ip) {
      console.log('IP field is required');
      return res.status(400).json({ message: 'IP field is required' });
    }

    const ipData = { ip, status: status || null, date: date || null };

    const query = 'UPDATE ip_addresses SET ip = ?, status = ?, date = ? WHERE id = ?';
    const [result] = await connection.query(query, [ipData.ip, ipData.status, ipData.date, id]);

    if (result.affectedRows === 0) {
      console.log('IP not found');
      return res.status(404).json({ message: 'IP not found' });
    }

    console.log('IP updated:', { id, ...ipData });
    res.json({ message: 'IP updated', affectedRows: result.affectedRows });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const deleteIP = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;

    const query = 'DELETE FROM ip_addresses WHERE id = ?';
    const [result] = await connection.query(query, [id]);

    if (result.affectedRows === 0) {
      console.log('IP not found');
      return res.status(404).json({ message: 'IP not found' });
    }

    console.log('IP deleted:', { id });
    res.json({ message: 'IP deleted', affectedRows: result.affectedRows });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

const checkIPExists = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { ip } = req.params;

    const query = 'SELECT * FROM ip_addresses WHERE ip = ?';
    const [results] = await connection.query(query, [ip]);

    if (results.length > 0) {
      console.log('IP exists:', { ip });
      res.json({ exists: true });
    } else {
      console.log('IP does not exist:', { ip });
      res.json({ exists: false });
    }
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { createIP, getIPs, updateIP, deleteIP, checkIPExists };
