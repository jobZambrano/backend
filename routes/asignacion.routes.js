const express = require('express');
const router = express.Router();
const AsignacionModel = require('../models/asignacion.model');

router.get('/', async (req, res) => {
  try {
    const asignaciones = await AsignacionModel.getAll();
    res.json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevaAsignacion = await AsignacionModel.create(req.body);
    res.status(201).json(nuevaAsignacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;