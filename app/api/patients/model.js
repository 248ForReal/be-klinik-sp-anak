const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const patientSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    nomor_antrian: {
      type: Number,
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
    waktu_tunggu: [{
      waktu_mulai: {
        type: Date,
        required: true
      },
      waktu_selesai: {
        type: Date,
        required: true
      }
    }],
    status: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'antrian'
  }
);

module.exports = model('Patient', patientSchema);