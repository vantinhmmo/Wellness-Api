// routes/wellnessRoutes.js
const express = require('express');
const router = express.Router();
const { createWellnessLog, getWellness } = require('../controllers/wellness.controller.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

router.use(authMiddleware);

router.get('/', getWellness);
router.post('/', createWellnessLog);
router.put('/:id', createWellnessLog);

module.exports = router;