const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  uuid: { type: String },
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  riwayat: [
    {
      nomor_antrian: { type: Number },
      nama_pasien: { type: String },
      nama_wali: { type: String },
      alamat: { type: String },
      no_telp: { type: String },
      ttl: { type: Date },
      gol_darah: { type: String },
      bb: { type: Number },
      tb: { type: Number },
      waktu_tunggu: [
        {
          waktu_mulai: { type: Date },
          waktu_selesai: { type: Date },
        }
      ],
      status: { type: String },
      createdAt: { type: Date },
      updatedAt: { type: Date },
    }
  ]
}, 
{
  timestamps: true,
  collection: 'user'
});

const User = mongoose.model('User', userSchema);

module.exports = User;