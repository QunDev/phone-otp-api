const fs = require('fs');
const path = require('path');

const getVersion = (req, res) => {
  try {
    const versionFilePath = path.join(__dirname, '../version.txt');
    fs.readFile(versionFilePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Error reading version file', error: err });
      }
      res.json({ version: data.trim() });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { getVersion };
