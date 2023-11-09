const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const respon = require('./app/respon');
const cookieSession = require('cookie-session');
const cors = require('cors');
const PatientRouter = require('./app/api/patients/router');
const UserRouter = require('./app/api/user/routeuser');
const User = require('./app/api/user/modeluser');
const Jadwal = require('./app/api/user/modeljadwal');
const pasien = require('./app/api/patients/model');

require('dotenv').config();
const app = express();

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY],
  maxAge: 24 * 60 * 60 * 1000,
  collectionName: 'user'
}));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  respon(200, 'aman', 'ini awal', res);
});



app.post('/regis', async (req, res, next) => {
  try {
    const { email, nama_pasien, nama_wali, alamat, no_telp, ttl, gol_darah, bb, tb, status } = req.body;

    const existingPatient = await pasien.findOne({ email });

    if (existingPatient) {
      return respon(400, null, 'Email sudah terdaftar', res);
    }

    const jadwal = await Jadwal.findOne().sort({ createdAt: -1 });

    if (!jadwal) {
      return respon(400, null, 'Jadwal Tidak Tersedia', res);
    }

    if (jadwal.antrian.length === 0) {
      return respon(400, null, 'Antrian sudah habis', res);
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

    const newUser = new User({
      uuid: '', 
      nama: nama_pasien, 
      email,
      role: 'user' 
    });

    await newUser.save();

    respon(201, savedPatient, 'Pasien berhasil dibuat', res);
  } catch (error) {
    next(error);
  }
});



app.post('/login', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      respon(404, null, 'Nama atau email salah', res);
    } else {
      if (req.session.user && req.session.user.email === email) {
        respon(403, null, 'Anda telah login dengan akun ini', res);
      } else {
        req.session.user = {
          nama: user.nama,
          email: user.email,
          role: user.role
        };
        respon(200, 'Login berhasil', null, res);
      }
    }
  } catch (err) {
    console.error(err);
    respon(500, null, 'Terjadi kesalahan server', res);
  }
});

app.get('/profile', (req, res) => {
  if (!req.session.user || !req.session.user.role) {
    respon(404, null, 'Login dulu bray', res);
  } else {
    const { role } = req.session.user;
    respon(200, `Halo, ${role}! Ini adalah halaman profil Anda.`, null, res);
  }
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.send('Anda telah berhasil keluar');
});

app.use('/api', UserRouter);
app.use('/api', PatientRouter);

module.exports = app;