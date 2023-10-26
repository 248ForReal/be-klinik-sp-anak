const pasien = require('./model'); 
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
    const result = await pasien.findOne({ nomor_antrian : id });

    if (!result) {
      return sendResponse(404, null, "Pasien tidak di temukan", res);
    }

    sendResponse(200,result, "yang ini bray", res);
  } catch (err) {
    next(err);
  }
};


const create = async (req, res, next) => {
  try {
    const { nomor_antrian, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb, jadwal } = req.body;

    if (!gol_darah || !no_telp || !nama_wali || !nama_pasien || !nomor_antrian) {
      return sendResponse(400, null, "Field yang diperlukan harus diisi", res);
    }
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
      jadwal,
    });
    sendResponse(201, {result }, "masuk Bray", res);
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

    sendResponse(200,result, "Hilang Brayy", res);
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