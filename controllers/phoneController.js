const connection = require('../config/db');

const createOrUpdatePhone = (req, res) => {
  try {
    const { phone, otp, date, status } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone field is required' });
    }

    // Kiểm tra sự tồn tại của phone
    connection.query('SELECT * FROM phone_otp WHERE phone = ?', [phone], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database query error', error: err });
      }

      const phoneData = {
        phone,
        otp: otp || null,
        date: date || null,
        status: status || null
      };

      if (results.length > 0) {
        // Phone đã tồn tại, cập nhật bản ghi
        const existingOtp = results[0].otp || '';
        const newOtp = existingOtp ? `${existingOtp}|${otp}` : otp;
        
        connection.query('UPDATE phone_otp SET otp = ?, date = ?, status = ? WHERE phone = ?', 
          [newOtp, phoneData.date, phoneData.status, phone], 
          (updateErr, updateResult) => {
            if (updateErr) {
              return res.status(500).json({ message: 'Database update error', error: updateErr });
            }
            res.json({ message: 'Phone updated', affectedRows: updateResult.affectedRows });
        });
      } else {
        // Phone chưa tồn tại, thêm mới bản ghi
        connection.query('INSERT INTO phone_otp (phone, otp, date, status) VALUES (?, ?, ?, ?)', 
          [phoneData.phone, phoneData.otp, phoneData.date, phoneData.status], 
          (insertErr, insertResult) => {
            if (insertErr) {
              return res.status(500).json({ message: 'Database insertion error', error: insertErr });
            }
            res.status(201).json({ id: insertResult.insertId, ...phoneData });
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getPhones = (req, res) => {
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

    connection.query(query, params, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database retrieval error', error: err });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const updatePhone = (req, res) => {
  try {
    const { id } = req.params;
    const { phone, otp, date, status } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone field is required' });
    }

    const phoneData = {
      phone,
      otp: otp || null,
      date: date || null,
      status: status || null
    };

    connection.query('SELECT * FROM phone_otp WHERE id = ?', [id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database query error', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Phone not found' });
      }

      const existingOtp = results[0].otp || '';
      const newOtp = existingOtp ? `${existingOtp}|${otp}` : otp;

      connection.query('UPDATE phone_otp SET phone = ?, otp = ?, date = ?, status = ? WHERE id = ?', 
        [phoneData.phone, newOtp, phoneData.date, phoneData.status, id], 
        (updateErr, updateResult) => {
          if (updateErr) {
            return res.status(500).json({ message: 'Database update error', error: updateErr });
          }
          res.json({ message: 'Phone updated', affectedRows: updateResult.affectedRows });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const deletePhone = (req, res) => {
  try {
    const { id } = req.params;

    connection.query('DELETE FROM phone_otp WHERE id = ?', [id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database deletion error', error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Phone not found' });
      }
      res.json({ message: 'Phone deleted', affectedRows: result.affectedRows });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getRecordsByHour = (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d %H:00:00') AS hour, 
        COUNT(*) AS total_records 
      FROM 
        phone_otp 
      GROUP BY 
        hour 
      ORDER BY 
        hour;
    `;

    connection.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database query error', error: err });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { createOrUpdatePhone, getPhones, updatePhone, deletePhone, getRecordsByHour };
