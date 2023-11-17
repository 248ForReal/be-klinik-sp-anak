const User = require('./modeluser');
const Jadwal = require('./modeljadwal');
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
    const result = await Jadwal.find();
    sendResponse(200, result, 'Get all jadwal', res);
  } catch (err) {
    sendResponse(404, null, 'Data not found', res);
    next(err);
  }
};

const createJadwal = async (req, res) => {
  try {
  const { tanggal, jam_pertama, jam_kedua } = req.body;
  

  const jadwalBaru = new Jadwal({
    tanggal,
    jam_pertama,
    jam_kedua
  });
  
  const durasiAntrian = 20 * 60 * 1000; // Durasi antrian dalam milidetik (20 menit)
  const selisih = hitungSelisihWaktu(jadwalBaru.jam_pertama, jadwalBaru.jam_kedua);
  const jumlahAntrian = hitungNomorAntrian(selisih);
  
  for (let i = 0; i < jumlahAntrian; i++) {
    const waktuMulai = new Date(jadwalBaru.jam_pertama.getTime() + i * durasiAntrian);
    const waktuSelesai = new Date(waktuMulai.getTime() + durasiAntrian);
    
    jadwalBaru.antrian.push({
      nomor_antrian: i + 1,
      waktu_mulai: waktuMulai,
      waktu_selesai: waktuSelesai
    });
  }
  
  jadwalBaru.jumlah_antrian_tersedia = jumlahAntrian;
  
  const jadwalTerbuat = await jadwalBaru.save();
  
  sendResponse(201,jadwalTerbuat ,'Jadwal berhasil ditambahkan', res);
  } catch (error) {
  sendResponse(500, error , 'Terjadi kesalahan saat menambahkan jadwal', res);
  }
  };
  
  function hitungSelisihWaktu(jamMulai, jamSelesai) {
  const selisih = Math.abs(new Date(jamSelesai) - new Date(jamMulai));
  const selisihMenit = Math.floor(selisih / 1000 / 60);
  
  return selisihMenit;
  }
  
  function hitungNomorAntrian(selisihMenit) {
  const nomorAntrian = Math.ceil(selisihMenit / 20);
  
  return nomorAntrian;
  }

module.exports = {
  getAllUsers,
  getAllJadwal,
  createJadwal
};