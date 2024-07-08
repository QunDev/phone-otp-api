const express = require('express');
const { createOrUpdatePhone, getPhones, updatePhone, deletePhone, getRecordsByHour, getPhoneByPhone } = require('../controllers/phoneController');
const protect = require('../middlewares/auth');

const router = express.Router();

router.route('/').post(createOrUpdatePhone).get(getPhones);
router.route('/:id').put(updatePhone).delete(deletePhone);
router.get('/check', getRecordsByHour);
router.get('/phone/:phone', getPhoneByPhone);

module.exports = router;
