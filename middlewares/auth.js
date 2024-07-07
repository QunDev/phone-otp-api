const jwt = require('jsonwebtoken');
const connection = require('../config/db');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, 'your_jwt_secret');
      
      connection.query('SELECT * FROM users WHERE id = ?', [decoded.id], (err, results) => {
        if (err) throw err;
        req.user = results[0];
        next();
      });

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;
