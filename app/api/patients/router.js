const express = require('express');
const router = express.Router();
const { index, create, find, update, destroy } = require('./controller')
const { checkAdminRole, checkUserRole } = require('../../middleware/auth');


router.get('/patients',checkAdminRole, index)
router.get('/patients/:id', find)
router.post('/patients', create)
router.put('/patients/:id', update)
router.delete('/patients/:id', destroy)

module.exports = router;