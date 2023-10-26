const User = require('./modeluser'); 
const sendResponse = require('../../respon');



const getAllUsers = async (req, res, next) => {
  try {
    const result = await User.find();
    sendResponse(200, result, 'Get all users', res);
  } catch (err) {
    sendResponse(404, null, 'Data not found', res);
    next(err);
  }
};



module.exports = {
  getAllUsers
};