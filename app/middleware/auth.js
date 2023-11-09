const respon = require('../respon');

const checkAdminRole = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
      respon(403,null, "Akses ditolak", res);
  } else {
    next();
  }
};

const checkUserRole = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    res.status(403).json({ message: 'Akses ditolak' });
  } else {
    next();
  }
};

module.exports = { checkAdminRole, checkUserRole };
