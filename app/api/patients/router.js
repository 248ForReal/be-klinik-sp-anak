const express = require('express');
const router = express.Router();
const { index, create, find, updatestatus, destroy,update } = require('./controller')
const { checkAdminRole, checkUserRole } = require('../../middleware/auth');

router.get('/patients', index);
router.get('/patients/:id', find);
router.post('/patients', create);
router.put('/patients/status/:id', updatestatus);
router.put('/patients/data/:id', update);
router.delete('/patients/:id', destroy);

module.exports = router;