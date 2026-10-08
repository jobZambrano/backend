const express = require('express');
const router = express.Router();
const CarreraController = require('../controllers/carreraController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, CarreraController.getById);
router.get('/', verifyToken, CarreraController.getAll);
router.post('/', verifyToken, CarreraController.create);
router.put('/:id', verifyToken, CarreraController.update);
router.delete('/:id', verifyToken, CarreraController.delete);

module.exports = router;