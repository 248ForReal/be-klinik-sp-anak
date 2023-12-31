const express = require('express');
const router = express.Router();
const { getallantrian,
    findantrian,
    updatedData,
    update_status,
    getAllUsers,
    getAllJadwal,
    createJadwal,
    hapusAntrian,
    deleteJadwal,
    deleteUser,
    findUser } = require('./controller')
const { checkAdminRole, checkUserRole } = require('../../middleware/auth');


//liat semua antrian
router.get('/pasien', getallantrian,checkAdminRole);

//liat pasien per-nomor antrian
router.get('/pasien/:id', findantrian);

//update antrian status menunggu ,mulai, selesai
router.put('/pasien/status/:id', update_status);

//update data antrian pasienn
router.put('/pasien/data/:id', updatedData);

//hapus antrian
router.delete('/pasien/:id', hapusAntrian);


//buat jadwal
router.post('/jadwal', createJadwal);

//liat jadwal
router.get('/jadwal', getAllJadwal);

//delete jadwal
router.delete('/jadwal/:id', deleteJadwal);


//liat semua user
router.get('/user', getAllUsers);

//delete user
router.delete('/user/:uuid', deleteUser);

//find user
router.get('/user/:uuid', findUser);

module.exports = router;

