const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../utils/auth');

// Rutas
router.get('/totales', verifyToken, DashboardController.getTotales);
router.get('/asignaturas', verifyToken, DashboardController.getUltimasAsignaturas);
router.get('/carreras', verifyToken, DashboardController.getUltimasCarreras);

module.exports = router;