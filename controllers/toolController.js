const fs = require('fs');
const path = require('path');

const getVersion = (req, res) => {
  try {
    const versionFilePath = path.join(__dirname, '../version.txt');
    fs.readFile(versionFilePath, 'utf8', (err, data) => {
      if (err) {
        console.log('Error reading version file:', err);
        return res.status(500).json({ message: 'Error reading version file', error: err });
      }
      console.log('Version retrieved:', data.trim());
      res.json({ version: data.trim() });
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const downloadApk = (req, res) => {
  try {
    const filePath = path.join(__dirname, '../files/app.apk');
    res.download(filePath, 'app.apk', (err) => {
      if (err) {
        console.log('Error downloading the file:', err);
        return res.status(500).json({ message: 'Error downloading the file', error: err });
      }
      console.log('File downloaded successfully:', filePath);
    });
  } catch (error) {
    console.log('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { getVersion, downloadApk };
