const User = require('../model/modeluser');
const Jadwal = require('../model/modeljadwal');
const pasien = require('../model/model');
const sendResponse = require('../../respon');



//liat berapa lagi antrian yg ditunggu
const antrianBerapa = async (req, res, next) => {
    const email = req.params.email;
  
    try {
      const dataPasien = await pasien.findOne({ email: email });
  
      if (dataPasien) {
        const response = {
          email: email,
          antrianBerapaLagi: dataPasien.nomor_antrian
        };
        sendResponse(200, response, `Email ${email} memiliki nomor antrian ke-${dataPasien.nomor_antrian}`, res);
      } else {
        sendResponse(404, null, `Email ${email} tidak ditemukan`, res);
      }
    } catch (err) {
      next(err);
    }
  };
//liat udah berapa kali ke klinik
const history = async (req, res, next) => {
    const { uuid } = req.params;
  
    try {
      const user = await User.findOne({ uuid: uuid });
  
      if (user) {
        const historyCount = user.riwayat.length;
  
        const response = {
          uuid: uuid,
          historyCount: historyCount
        };
  
        sendResponse(200, response, `User dengan UUID ${uuid} memiliki ${historyCount} data riwayat`, res);
      } else {
        sendResponse(404, null, `User dengan UUID ${uuid} tidak ditemukan`, res);
      }
    } catch (err) {
      next(err);
    }
  };


//liat antrian 
const liatantrian = async (req, res, next) => {
    try {
      const result = await pasien.find();
      sendResponse(200, result, "Get all data", res);
    } catch (err) {
      sendResponse(404, null, "Data not found", res);
      next(err);
    }
  };

//regis antrian
const regis_antrian = async (req, res, next) => {

    try {
    const { email, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb, status } = req.body;

    const existingPatient = await pasien.findOne({ email });

    if (existingPatient) {
      return  sendResponse(400, null, 'Email sudah terdaftar', res);
    }

    const jadwal = await Jadwal.findOne().sort({ createdAt: -1 });

    if (!jadwal) {
      return sendResponse(400, null, 'Jadwal Tidak Tersedia', res);
    }

    if (jadwal.antrian.length === 0) {
      return  sendResponse(400, null, 'Antrian sudah habis', res);
    }

    const antrianPertama = jadwal.antrian.shift();
    const { waktu_mulai, waktu_selesai, nomor_antrian } = antrianPertama;

    await jadwal.save();
    const newPatient = new pasien({
      email,
      nomor_antrian,
      nama_pasien,
      nama_wali,
      alamat,
      no_telp,
      ttl,
      gol_darah,
      bb,
      tb,
      waktu_tunggu: [{ waktu_mulai, waktu_selesai }],
      status,
      createdAt: new Date()
    });

    const savedPatient = await newPatient.save();

  

    sendResponse(201, savedPatient, 'Pasien berhasil dibuat', res);
  } catch (error) {
    next(error);
  }
};


module.exports = {
 liatantrian,
 regis_antrian,
 antrianBerapa,
 history
};