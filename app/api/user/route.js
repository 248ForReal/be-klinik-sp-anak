const express = require('express');
const router = express.Router();
const {  liatantrian, regis_antrian,antrianBerapa,history,kunjunganTerakhir } = require('./controller')

const { checkAdminRole, checkUserRole } = require('../../middleware/auth');

//liat antrian
router.get('/antrian', liatantrian);

//liat berapa antrian lagi
router.get('/antrian/:email', antrianBerapa);

//liat kunjungan ke klinik ter-akhir kali
router.get('/kunjungan/:email', kunjunganTerakhir);

//regis supaya dapat antrian
router.post('/regis', regis_antrian);

//liat sudah berapa kali ke klinik
router.get('/history/:uuid', history);

module.exports = router;