const express = require('express');
const router = express.Router();
const ProfesorController = require('../controllers/profesorController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, ProfesorController.getById);
router.get('/', verifyToken, ProfesorController.getAll);
router.post('/', verifyToken, ProfesorController.create);
router.put('/:id', verifyToken, ProfesorController.update);
router.delete('/:id', verifyToken, ProfesorController.delete);

module.exports = router;