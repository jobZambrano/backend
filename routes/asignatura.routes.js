const express = require('express');
const router = express.Router();
const AsignaturaModel = require('../models/asignatura.model');

router.get('/', async (req, res) => {
  try {
    const asignaturas = await AsignaturaModel.getAll();
    res.json(asignaturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevaAsignatura = await AsignaturaModel.create(req.body);
    res.status(201).json(nuevaAsignatura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;