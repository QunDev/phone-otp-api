const express = require('express');
const router = express.Router();
const { getVersion } = require('../controllers/toolController');
// New route for getting version
router.get('/version', getVersion);

module.exports = router;
