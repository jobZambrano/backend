const express = require('express');
const router = express.Router();
const AsignaturaController = require('../controllers/asignaturaController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, AsignaturaController.getById);
router.get('/', verifyToken, AsignaturaController.getAll);
router.post('/', verifyToken, AsignaturaController.create);
router.put('/:id', verifyToken, AsignaturaController.update);
router.delete('/:id', verifyToken, AsignaturaController.delete);

module.exports = router;