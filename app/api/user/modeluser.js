const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  uuid: { type: String, default: () => import('nanoid').then(({ nanoid }) => nanoid(10)), unique: true },
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true }
}, 
{
timestamps: true,
collection: 'user'
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;