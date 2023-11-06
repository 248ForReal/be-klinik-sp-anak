const User = require('./modeluser'); 
const jadwal = require('./modeljadwal'); 
const sendResponse = require('../../respon');



const getAllUsers = async (req, res, next) => {
  try {
    const result = await User.find();
    sendResponse(200, result, 'Get all users', res);
  } catch (err) {
    sendResponse(404, null, 'Data not found', res);
    next(err);
  }
};

const getAllJadwal = async (req, res, next) => {
  try {
    const result = await jadwal.find();
    sendResponse(200, result, 'Get all users', res);
  } catch (err) {
    sendResponse(404, null, 'Data not found', res);
    next(err);
  }
};

const createJadwal = async (req, res, next) => {
  try {
    const { tanggal, jam_operasional } = req.body;

    const newJadwal = new jadwal({
      tanggal: new Date(tanggal),
      jam_operasional
    });

    const result = await newJadwal.save();

    sendResponse(201, result, 'Jadwal berhasil dibuat', res);
  } catch (err) {
    sendResponse(400, null, 'Gagal membuat jadwal', res);
    next(err);
  }
};



module.exports = {
  getAllUsers,
  getAllJadwal,
  createJadwal
};