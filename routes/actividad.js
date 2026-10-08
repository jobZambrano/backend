const express = require('express');
const router = express.Router();
const ActividadController = require('../controllers/actividadController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, ActividadController.getById);
router.get('/', verifyToken, ActividadController.getAll);
router.post('/', verifyToken, ActividadController.create);
router.put('/:id', verifyToken, ActividadController.update);
router.delete('/:id', verifyToken, ActividadController.delete);

module.exports = router;