const express = require('express');
const router = express.Router();
const AsignacionController = require('../controllers/asignacionController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, AsignacionController.getById);
router.get('/', verifyToken, AsignacionController.getAll);
router.post('/', verifyToken, AsignacionController.create);
router.put('/:id', verifyToken, AsignacionController.update);
router.delete('/:id', verifyToken, AsignacionController.delete);

module.exports = router;