const pasien = require('./model');
const Jadwal = require('../user/modeljadwal');
const sendResponse = require('../../respon');



const index = async (req, res, next) => {
  try {
    const result = await pasien.find();
    sendResponse(200, result, "Get all data", res);
  } catch (err) {
    sendResponse(404, null, "Data not found", res);
    next(err);
  }
};

const find = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pasien.findOne({ nomor_antrian: id });

    if (!result) {
      return sendResponse(404, null, "Pasien tidak ditemukan", res);
    }

    sendResponse(200, result, "yang ini bray", res);
  } catch (err) {
    next(err);
  }
};


const create = async (req, res, next) => {
  try {
    const { email, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb, status } = req.body;

    const existingPatient = await pasien.findOne({ email });

    if (existingPatient) {
      return  sendResponse(400, null, 'Email sudah terdaftar', res);
    }

    const jadwal = await Jadwal.findOne().sort({ createdAt: -1 });

    if (!jadwal) {
      return  sendResponse(400, null, 'Jadwal Tidak Tersedia', res);
    }

    if (jadwal.antrian.length === 0) {
      return sendResponse(400, null, 'Antrian sudah habis', res);
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





const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedData = {
      status: "mulai" // Mengubah status menjadi "mulai"
    };

    const result = await pasien.findOneAndUpdate(
      { nomor_antrian: id },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!result) {
      return sendResponse(404, null, "Data pasien tidak ditemukan", res);
    }

    const waktuMulai = new Date(result.waktu_tunggu[0].waktu_mulai);
    const waktuSelesai = new Date(result.waktu_tunggu[0].waktu_selesai);
    const durasiWaktu = Math.ceil((waktuSelesai.getTime() - waktuMulai.getTime()) / 1000);

    console.log(`Durasi waktu: ${durasiWaktu} detik`);

    let sisaWaktu = durasiWaktu;

    const timer = setInterval(() => { 
      if (sisaWaktu <= 0) {
        clearInterval(timer);
        console.log("Timer selesai");
        // Lakukan tindakan setelah timer selesai
      } else {
        console.log(`Sisa waktu: ${sisaWaktu} detik`);
        sisaWaktu--;
      }
    }, 1000);

    sendResponse(200, { ...result._doc, durasiWaktu }, "Data berhasil diperbarui", res);
  } catch (err) {
    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    const { nomor_antrian } = req.params;
    const result = await pasien.findOneAndRemove(nomor_antrian);

    if (!result) {
      return sendResponse(404, null, "Data pasien tidak ditemukan", res);
    }

    sendResponse(200, result, "Hilang Brayy", res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  index,
  find,
  create,
  update,
  destroy
};
