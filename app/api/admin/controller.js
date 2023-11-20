const pasien = require('../model/model');
const Jadwal = require('../model/modeljadwal');
const usermodel = require('../model/modeluser');
const sendResponse = require('../../respon');
const moment = require('moment');
let timer;
let sisaWaktu;
let stopwatchTimer;
let lastElapsedTime;


//ini buat jadwal dulu
const createJadwal = async (req, res) => {
  try {
  const { tanggal, jam_pertama, jam_kedua } = req.body;
  
  const lastJadwal = await Jadwal.findOne().sort({ nomor_id: -1 }).exec();
  let nomor_id = 1;
  if (lastJadwal) {
    nomor_id = lastJadwal.nomor_id + 1;
  }

  const jadwalBaru = new Jadwal({
    nomor_id,
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
//bagian dari buat jadwal
  function hitungSelisihWaktu(jamMulai, jamSelesai) {
  const selisih = Math.abs(new Date(jamSelesai) - new Date(jamMulai));
  const selisihMenit = Math.floor(selisih / 1000 / 60);
  
  return selisihMenit;
  }
//ini juga bagian dari buat  jadwal
  function hitungNomorAntrian(selisihMenit) {
  const nomorAntrian = Math.ceil(selisihMenit / 20);
  
  return nomorAntrian;
  }
//ini liat semua jadwal
  const getAllJadwal = async (req, res, next) => {
    try {
      const result = await Jadwal.find();
      sendResponse(200, result, 'Get all jadwal', res);
    } catch (err) {
      sendResponse(404, null, 'Data not found', res);
      next(err);
    }
  };
//ini hapus jadwal 
  const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

  
    const jadwalTerhapus = await Jadwal.findOneAndDelete({ nomor_id : id });
  
    if (!jadwalTerhapus) {
      sendResponse(404, null, 'Jadwal tidak ditemukan', res);
      return;
    }
  
    sendResponse(200, jadwalTerhapus, 'Jadwal berhasil dihapus', res);
  } catch (error) {
    sendResponse(500, error, 'Terjadi kesalahan saat menghapus jadwal', res);
  }
  };




//ini liat semua user
const getAllUsers = async (req, res, next) => {
  try {
    const result = await usermodel.find();
    sendResponse(200, result, 'Get all users', res);
  } catch (err) {
    sendResponse(404, null, 'Data not found', res);
    next(err);
  }
};
//ini hapus user
const deleteUser = async (req, res, next) => {
  const uuid = req.params.uuid; // Mengambil UUID dari parameter permintaan

  try {
    const result = await usermodel.findOneAndDelete({ uuid: uuid });
    
    if (result) {
      sendResponse(200, result, 'User deleted successfully', res);
    } else {
      sendResponse(404, null, 'User not found', res);
    }
  } catch (err) {
    sendResponse(500, null, 'Failed to delete user', res);
    next(err);
  }
};
//ini find user 
const findUser = async (req, res, next) => {
  const { uuid } = req.params;

  try {
    const user = await usermodel.findOne({ uuid: uuid });
    if (user) {
      sendResponse(200, user, 'User found', res);
    } else {
      sendResponse(404, null, 'User not found', res);
    }
  } catch (err) {
    sendResponse(500, null, 'Internal server error', res);
    next(err);
  }
};




//ini liat semua antrian
const getallantrian = async (req, res, next) => {
  try {
    const result = await pasien.find();
    sendResponse(200, result, "Get all data", res);
  } catch (err) {
    sendResponse(404, null, "Data not found", res);
    next(err);
  }
};
// ini liat atrian dari nomor antrian
const findantrian = async (req, res, next) => {
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
//ini update data antrian
const updatedData = async (req, res, next) => {
  const { id } = req.params;
  const { email, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb } = req.body;

  const updatedData = {
    email,
    nama_pasien,
    nama_wali,
    alamat,
    no_telp,
    ttl,
    gol_darah,
    bb,
    tb
  };

  try {
    const updatedPatient = await pasien.findOneAndUpdate(
      { nomor_antrian: id },
      updatedData,
      { new: true }
    );

    if (updatedPatient) {
      sendResponse(200, updatedPatient, "Data updated successfully", res);
    } else {
      sendResponse(404, null, "Patient not found", res);
    }
  } catch (err) {
    sendResponse(500, null, "Failed to update patient data", res);
    next(err);
  }
};

 
const updateNomorAntrian = async (deletedNomorAntrian) => {
  try {
    const pasienMenunggu = await pasien.find({ nomor_antrian: { $gt: deletedNomorAntrian } });

    for (let i = 0; i < pasienMenunggu.length; i++) {
      const pasien = pasienMenunggu[i];
      pasien.nomor_antrian = pasien.nomor_antrian - 1;
      await pasien.save();
    }

    console.log("Nomor antrian berhasil diperbarui");
  } catch (err) {
    console.error("Gagal memperbarui nomor antrian:", err);
  }
};

//ini bagian dari fungsi updat status(mulai dan menunggu dan selesai)  antrian
const movePasienToRiwayatByEmail = async (email, pasien) => {
  try {
    const user = await usermodel.findOne({ email });

   
    const waktuTunggu = {
      waktu_mulai: pasien.waktu_tunggu[0].waktu_mulai,
      waktu_selesai: pasien.waktu_tunggu[0].waktu_selesai,
    };

    user.riwayat.push({
      nomor_antrian: pasien.nomor_antrian,
      nama_pasien: pasien.nama_pasien,
      nama_wali   : pasien.nama_wali,
      alamat      : pasien.alamat,
      no_telp     : pasien.no_telp,
      ttl         : pasien.ttl,
      gol_darah   : pasien.gol_darah,
      bb          : pasien.bb,
      tb          : pasien.tb,
      waktu_tunggu: [waktuTunggu],
      status: pasien.status,
      createdAt: pasien.createdAt,
      updatedAt: pasien.updatedAt,
    });

    await user.save();

    console.log("Data pasien berhasil dipindahkan ke riwayat");
    await pasien.deleteOne({ nomor_antrian: pasien.nomor_antrian });

    console.log("Data pasien berhasil dihapus dari daftar pasien aktif");
  } catch (err) {
    console.error("Terjadi kesalahan:", err);
  }
};
//ini adalah update status mulai dan menunggu dan selesai
const update_status = async (req, res, next) => {
  const updateWaktuPasien = async (updatedPasien) => {
    try {
      const pasienMenunggu = await pasien.find({ status: "menunggu" });

      let waktuMulaiUpdate = updatedPasien.waktu_tunggu[0].waktu_selesai;

      for (let i = 0; i < pasienMenunggu.length; i++) {
        const pasien = pasienMenunggu[i];
        const waktuSelesaiUpdate = new Date(waktuMulaiUpdate.getTime() + 20 * 60 * 1000);

        pasien.waktu_tunggu[0].waktu_mulai = waktuMulaiUpdate;
        pasien.waktu_tunggu[0].waktu_selesai = waktuSelesaiUpdate;

        await pasien.save();

        waktuMulaiUpdate = waktuSelesaiUpdate;
      }

      console.log("Waktu pasien berhasil diperbarui");
    } catch (err) {
      console.error("Gagal memperbarui waktu pasien:", err);
    }
  };

  try {
    const { id } = req.params;
    const result = await pasien.findOne({ nomor_antrian: id });

    if (!result) {
      return sendResponse(404, null, "Data pasien tidak ditemukan", res);
    }

    const pengguna = await usermodel.findOne({ email: result.email });
    
    if (!pengguna) {
      return sendResponse(404, null, "user tidak ditemukan", res);
    }

    if (result.status === "menunggu") {
      result.status = "mulai";
      await result.save();

      const waktuMulai = new Date(result.waktu_tunggu[0].waktu_mulai);
      const waktuSelesai = new Date(result.waktu_tunggu[0].waktu_selesai);
      const durasiWaktu = Math.ceil((waktuSelesai.getTime() - waktuMulai.getTime()) / 1000);

      console.log(`Durasi waktu: ${durasiWaktu} detik`);

      sisaWaktu = durasiWaktu;

      timer = setInterval(() => {
        if (sisaWaktu <= 0) {
          clearInterval(timer);
          console.log("Timer selesai");

          result.save().then(() => {
            console.log("Memulai stopwatch");

            let elapsedTime = 0;

            stopwatchTimer = setInterval(() => {
              console.log(`Waktu tambahan: ${elapsedTime} detik`);
              lastElapsedTime = elapsedTime;
              elapsedTime++;
              if (elapsedTime >= 1200) {
                clearInterval(stopwatchTimer);
                console.log("Stopwatch selesai");
              }
            }, 1000);
          }).catch(err => {
            console.error("Gagal menyimpan perubahan status:", err);
          });
        } else {
          console.log(`Sisa waktu: ${sisaWaktu} detik`);
          sisaWaktu--;
        }
      }, 1000);

      sendResponse(200, result, "Status berhasil diperbarui", res);
    } else if (result.status === "mulai") {
      clearInterval(timer);
      clearInterval(stopwatchTimer);
      result.status = "selesai";

      if (sisaWaktu === 0) {
        const waktuTambahanTerakhir = lastElapsedTime;
        const waktuSelesai = new Date(result.waktu_tunggu[0].waktu_selesai);
        const waktuSelesaiBaru = new Date(waktuSelesai.getTime() + waktuTambahanTerakhir * 1000);
        result.waktu_tunggu[0].waktu_selesai = waktuSelesaiBaru;
        console.log("Waktu tambahan terakhir:", waktuTambahanTerakhir);
      } else {
        const waktuSelesai = new Date(result.waktu_tunggu[0].waktu_selesai);
        const waktuSelesaiBaru = new Date(waktuSelesai.getTime() - sisaWaktu * 1000);
        result.waktu_tunggu[0].waktu_selesai = waktuSelesaiBaru;
      }

      console.log("Sisa waktu terakhir:", sisaWaktu);

      result.save().then(async () => {
        console.log("Status diubah menjadi selesai");
        sendResponse(200, result, "Status berhasil diperbarui", res);
        updateWaktuPasien(result);
        await updateNomorAntrian(result.nomor_antrian);
        await movePasienToRiwayatByEmail(pengguna.email, result);;
      }).catch(err => {
        console.error("Gagal menyimpan perubahan status:", err);
        sendResponse(500, null, "Terjadi kesalahan saat menyimpan perubahan status", res);
      });
    }
  } catch (err) {
    next(err);
  }
};
//ini adalah hapus antrian
const hapusAntrian = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pasienToDelete = await pasien.findOneAndDelete({ nomor_antrian: id });
    if (pasienToDelete) {
    
      const queuesToUpdate = await pasien.find({ nomor_antrian: { $gt: id } });

      for (let i = 0; i < queuesToUpdate.length; i++) {
        const queue = queuesToUpdate[i];
        const newQueueNumber = queue.nomor_antrian - 1;
        const newStartTime = moment(queue.waktu_tunggu[0].waktu_mulai).subtract(20, 'minutes');
        const newEndTime = moment(queue.waktu_tunggu[0].waktu_selesai).subtract(20, 'minutes');
        await pasien.updateOne(
          { _id: queue._id },
          {
            $set: {
              nomor_antrian: newQueueNumber,
              'waktu_tunggu.0.waktu_mulai': newStartTime.toISOString(),
              'waktu_tunggu.0.waktu_selesai': newEndTime.toISOString()
            }
          }
        );
      }

      const updatedQueues = await pasien.find({ nomor_antrian: { $gte: 1 } });

      sendResponse(200, pasienToDelete, "Antrian berhasil dihapus dan waktu serta nomor antrian berhasil diperbarui", res);
    } else {
      sendResponse(404, null, "Antrian tidak ditemukan", res);
    }
  } catch (error) {
    sendResponse(500, null, "Gagal menghapus antrian", res);
    next(error);
  }
};

module.exports = {
  getallantrian,
  findantrian,
  updatedData,
  update_status,
  getAllUsers,
  getAllJadwal,
  createJadwal,
  hapusAntrian,
  deleteJadwal,
  deleteUser,
  findUser
};