const express = require('express');
const router = express.Router();
const { getVersion, downloadApk } = require('../controllers/toolController');

// Existing routes
router.get('/version', getVersion);

// New route for downloading the APK file
router.get('/apk', downloadApk);

module.exports = router;
