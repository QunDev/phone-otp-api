const express = require('express');
const router = express.Router();
const { getVersion, downloadApk } = require('../controllers/yourControllerFile');

// Existing routes
router.get('/version', getVersion);

// New route for downloading the APK file
router.get('/apk', downloadApk);

module.exports = router;
