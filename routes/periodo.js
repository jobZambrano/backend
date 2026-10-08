const express = require('express');
const router = express.Router();
const PeriodoController = require('../controllers/periodoController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, PeriodoController.getById);
router.get('/', verifyToken, PeriodoController.getAll);
router.post('/', verifyToken, PeriodoController.create);
router.put('/:id', verifyToken, PeriodoController.update);
router.delete('/:id', verifyToken, PeriodoController.delete);

module.exports = router;