const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const respon = require('./app/respon');
const cookieSession = require('cookie-session');
const PatientRouter = require('./app/api/patients/router');
const UserRouter = require('./app/api/user/routeuser');
const User = require('./app/api/user/modeluser');

require('dotenv').config();
const app = express();

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY],
  maxAge: 24 * 60 * 60 * 1000,
  collectionName: 'user'
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  respon(200, 'aman', 'ini awal', res);
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