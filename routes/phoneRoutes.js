const express = require('express');
const { createOrUpdatePhone, getPhones, updatePhone, deletePhone, getRecordsByHour } = require('../controllers/phoneController');
const protect = require('../middlewares/auth');

const router = express.Router();

router.route('/').post(createOrUpdatePhone).get(getPhones);
router.route('/:id').put(updatePhone).delete(deletePhone);
router.get('/check', getRecordsByHour);

module.exports = router;
