const express = require('express');
const router = express.Router();
const CoordinadorController = require('../controllers/coordinadorController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, CoordinadorController.getById);
router.get('/', verifyToken, CoordinadorController.getAll);
router.post('/', verifyToken, CoordinadorController.create);
router.put('/:id', verifyToken, CoordinadorController.update);
router.delete('/:id', verifyToken, CoordinadorController.delete);

module.exports = router;