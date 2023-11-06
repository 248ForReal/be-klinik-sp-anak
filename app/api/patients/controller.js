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

const moment = require('moment-timezone');

const create = async (req, res, next) => {
  try {
    const { email, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb, status } = req.body;

    const jadwal = await Jadwal.findOne().sort({ tanggal: 1 });

    if (!jadwal) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    }

    const totalAntrian = jadwal.antrian.length;

    if (totalAntrian === 0) {
      return res.status(400).json({ error: 'Antrian sudah habis' });
    }

    const antrianPertama = jadwal.antrian[0];
    const { waktu_mulai, waktu_selesai, tanggal } = antrianPertama;

    const tanggalCreate = moment().tz('Asia/Jakarta').startOf('day');
    const tanggalJadwal = moment(tanggal).tz('Asia/Jakarta').startOf('day');

    console.log(tanggalCreate);
    console.log(tanggalJadwal);
    if (!tanggalCreate.isSame(tanggalJadwal)) {
      return res.status(400).json({ error: 'Tanggal create tidak sesuai dengan tanggal jadwal' });
    }

    
    jadwal.antrian.shift();
    await jadwal.save();

    const nomorAntrianTerakhir = await pasien.findOne().sort({ nomor_antrian: -1 }).select('nomor_antrian');
    const nomorAntrian = nomorAntrianTerakhir ? nomorAntrianTerakhir.nomor_antrian + 1 : 1;

    const newPatient = new pasien({
      email,
      nomor_antrian: nomorAntrian,
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
      create_at: tanggal
    });

    const savedPatient = await newPatient.save();

    res.status(201).json(savedPatient);
  } catch (error) {
    next(error);
  }
};



const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nomor_antrian, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb, jadwal } = req.body;

    const result = await pasien.findOneAndUpdate(
      { nomor_antrian: id },
      { nomor_antrian, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb, jadwal },
      { new: true, runValidators: true }
    );

    if (!result) {
      return sendResponse(404, null, "Data pasien tidak ditemukan", res);
    }

    sendResponse(200, result, "berhasil di update Bray", res);
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
