const express = require('express');
const router = express.Router();
const {  liatantrian, regis_antrian,antrianBerapa,history } = require('./controller')

const { checkAdminRole, checkUserRole } = require('../../middleware/auth');

//liat antrian
router.get('/antrian', liatantrian);

//liat berapa antrian lagi
router.get('/antrian/:email', antrianBerapa);

//regis supaya dapat antrian
router.post('/regis', regis_antrian);

//liat sudah berapa kali ke klinik
router.get('/history/:uuid', history);

module.exports = router;