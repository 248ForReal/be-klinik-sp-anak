const express = require('express');
const router = express.Router();
const { getAllUsers, getAllJadwal, createJadwal } = require('./controlleruser')

const { checkAdminRole, checkUserRole } = require('../../middleware/auth');

router.get('/users', getAllUsers);
router.get('/jadwal', getAllJadwal);
router.post('/buat',createJadwal);
module.exports = router;