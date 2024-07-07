const express = require('express');
const { createIP, getIPs, updateIP, deleteIP, checkIPExists } = require('../controllers/ipController');
const protect = require('../middlewares/auth');

const router = express.Router();

router.route('/').post(createIP).get(getIPs);
router.route('/:id').put(updateIP).delete(deleteIP);
router.route('/check/:ip').get(checkIPExists);

module.exports = router;
