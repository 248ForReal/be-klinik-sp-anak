const express = require('express');
const router = express.Router();
const { getAllUsers } = require('./controlleruser')
const { checkAdminRole, checkUserRole } = require('../../middleware/auth');

router.get('/users',checkAdminRole, getAllUsers);
module.exports = router;