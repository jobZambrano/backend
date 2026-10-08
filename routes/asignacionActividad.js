const express = require('express');
const router = express.Router();
const AsignacionActividadController = require('../controllers/asignacionActividadController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, AsignacionActividadController.getById);
router.get('/', verifyToken, AsignacionActividadController.getAll);
router.post('/', verifyToken, AsignacionActividadController.create);
router.put('/:id', verifyToken, AsignacionActividadController.update);
router.delete('/:id', verifyToken, AsignacionActividadController.delete);

module.exports = router;