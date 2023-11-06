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
      return sendResponse(404, null, "Pasien tidak di temukan", res);
    }

    sendResponse(200, result, "yang ini bray", res);
  } catch (err) {
    next(err);
  }
};



const create = async (req, res, next) => {
  try {
    const { nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb } = req.body;

    if (!gol_darah || !no_telp || !nama_wali || !nama_pasien) {
      return sendResponse(400, null, "Field yang diperlukan harus diisi", res);
    }

    const jadwal = await Jadwal.findOne();

    if (!jadwal || !jadwal.tanggal) {
      return sendResponse(400, null, "Tidak ada jadwal yang tersedia", res);
    }

    const today = new Date().toISOString().split('T')[0];

    if (jadwal.tanggal.toISOString().split('T')[0] !== today) {
      return sendResponse(400, null, "Tidak bisa menambahkan pasien pada tanggal ini", res);
    }

    let lastPatient = await pasien.findOne().sort({ nomor_antrian: -1 });

    if (!lastPatient) {
      lastPatient = { nomor_antrian: 0 };
    }

    const count = lastPatient.nomor_antrian;

    if (count >= 12) {
      return sendResponse(400, null, "Batas jumlah pasien per hari telah tercapai", res);
    }

    let nomor_antrian = count + 1;

    const result = await pasien.create({
      nomor_antrian,
      nama_pasien,
      nama_wali,
      alamat,
      no_telp,
      ttl,
      gol_darah,
      bb,
      tb,
      waktu_tunggu: jadwal.jam_operasional, // Menambahkan waktu_tunggu dari jam_operasional di jadwal
      jadwal: today,
    });

    sendResponse(201, { result }, "Pasien berhasil ditambahkan", res);
  } catch (err) {
    next(err);
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