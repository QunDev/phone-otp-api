const connection = require('../config/db');

const createIP = (req, res) => {
  try {
    const { ip, status, date } = req.body;

    if (!ip) {
      console.log('IP field is required');
      return res.status(400).json({ message: 'IP field is required' });
    }

    const ipData = {
      ip,
      status: status || null,
      date: date || null
    };

    connection.query('INSERT INTO ip_addresses (ip, status, date) VALUES (?, ?, ?)', 
      [ipData.ip, ipData.status, ipData.date], 
      (err, result) => {
        if (err) {
          console.log('Database insertion error:', err);
          return res.status(500).json({ message: 'Database insertion error', error: err });
        }
        console.log('IP created:', { id: result.insertId, ...ipData });
        res.status(201).json({ id: result.insertId, ...ipData });
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getIPs = (req, res) => {
  try {
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

    connection.query(query, params, (err, results) => {
      if (err) {
        console.log('Database retrieval error:', err);
        return res.status(500).json({ message: 'Database retrieval error', error: err });
      }
      console.log('IPs retrieved:', results);
      res.json(results);
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateIP = (req, res) => {
  try {
    const { id } = req.params;
    const { ip, status, date } = req.body;

    if (!ip) {
      console.log('IP field is required');
      return res.status(400).json({ message: 'IP field is required' });
    }

    const ipData = {
      ip,
      status: status || null,
      date: date || null
    };

    connection.query('UPDATE ip_addresses SET ip = ?, status = ?, date = ? WHERE id = ?', 
      [ipData.ip, ipData.status, ipData.date, id], 
      (err, result) => {
        if (err) {
          console.log('Database update error:', err);
          return res.status(500).json({ message: 'Database update error', error: err });
        }
        if (result.affectedRows === 0) {
          console.log('IP not found');
          return res.status(404).json({ message: 'IP not found' });
        }
        console.log('IP updated:', { id, ...ipData });
        res.json({ message: 'IP updated', affectedRows: result.affectedRows });
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const deleteIP = (req, res) => {
  try {
    const { id } = req.params;

    connection.query('DELETE FROM ip_addresses WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.log('Database deletion error:', err);
        return res.status(500).json({ message: 'Database deletion error', error: err });
      }
      if (result.affectedRows === 0) {
        console.log('IP not found');
        return res.status(404).json({ message: 'IP not found' });
      }
      console.log('IP deleted:', { id });
      res.json({ message: 'IP deleted', affectedRows: result.affectedRows });
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const checkIPExists = (req, res) => {
  try {
    const { ip } = req.params;

    connection.query('SELECT * FROM ip_addresses WHERE ip = ?', [ip], (err, results) => {
      if (err) {
        console.log('Database check error:', err);
        return res.status(500).json({ message: 'Database check error', error: err });
      }
      if (results.length > 0) {
        console.log('IP exists:', { ip });
        res.json({ exists: true });
      } else {
        console.log('IP does not exist:', { ip });
        res.json({ exists: false });
      }
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { createIP, getIPs, updateIP, deleteIP, checkIPExists };
