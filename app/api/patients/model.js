const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const patientSchema = new Schema(
  {
    nomor_antrian: {
      type: String,
      required: true
    },
    nama_pasien: {
      type: String,
      required: true
    },
    nama_wali: {
      type: String,
      required: true
    },
    alamat: {
      type: String,
      required: true
    },
    no_telp: {
      type: String,
      required: true
    },
    ttl: {
      type: Date,
      required: true
    },
    gol_darah: {
      type: String,
      required: true
    },
    bb: {
      type: Number,
      required: true
    },
    tb: {
      type: Number,
      required: true
    },
    jadwal: {
      type: String
    }
  },
  {
    timestamps: true,
    collection: 'antrian'
  }
);

module.exports = model('', patientSchema);