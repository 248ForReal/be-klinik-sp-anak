const pasien = require('./model');
const Jadwal = require('../user/modeljadwal');
const usermodel = require('../../api/user/modeluser');
const sendResponse = require('../../respon');
const moment = require('moment');



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

const update = async (req, res, next) => {
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



let timer;
let sisaWaktu;
let stopwatchTimer;
let lastElapsedTime;

const movePasienToRiwayatByEmail = async (email, pasien) => {
  try {
    const user = await usermodel.findOne({ email });

    if (!user) {
      console.log("Pengguna tidak ditemukan");
      return;
    }

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

const updatestatus = async (req, res, next) => {
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
      console.log("Pengguna tidak ditemukan");
      return;
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
 
const destroy = async (req, res, next) => {
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
  index,
  find,
  update,
  create,
  updatestatus,
  destroy
};