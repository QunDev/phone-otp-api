const express = require('express');
const multer = require('multer');
const router = express.Router();
const phoneController = require('../controllers/phoneGetController');

const upload = multer({ dest: 'uploads/' });

router.post('/phones/upload', upload.single('file'), phoneController.uploadPhones);
router.get('/phones/random', phoneController.getRandomPhone);
router.post('/phones', phoneController.createPhone);
router.get('/phones', phoneController.getPhones);
router.get('/phones/:id', phoneController.getPhoneById);
router.put('/phones/is_taken', phoneController.updateIsTakenForAll);
router.put('/phones/:id/is_taken', phoneController.updateIsTakenById);
router.put('/phones/:id', phoneController.updatePhone);
router.delete('/phones/:id', phoneController.deletePhone);

module.exports = router;
