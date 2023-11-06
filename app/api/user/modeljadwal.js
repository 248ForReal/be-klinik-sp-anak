const mongoose = require('mongoose');
const { Schema } = mongoose;

const jadwalSchema = new Schema({
  tanggal: { type: Date, required: true },
  jam_operasional: { type: String, required: true }
}, 
{
  collection: 'jadwal'
});

const Jadwal = mongoose.model('Jadwal', jadwalSchema);

module.exports = Jadwal;