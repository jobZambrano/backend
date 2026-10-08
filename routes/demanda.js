const express = require('express');
const router = express.Router();
const DemandaController = require('../controllers/demandaController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/:id', verifyToken, DemandaController.getById);
router.get('/', verifyToken, DemandaController.getAll);
router.post('/', verifyToken, DemandaController.create);
router.put('/:id', verifyToken, DemandaController.update);
router.delete('/:id', verifyToken, DemandaController.delete);

module.exports = router;