const User = require('./user/modeluser');
const respon = require('../respon');

const login = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'User tidak ditemukan' });
    }

    req.session.userId = user.uuid;

    const { uuid, nama, email, role } = user;

    res.status(200).json({ uuid, nama, email, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Terjadi kesalahan server' });
  }
};

module.exports = {
    login
  };