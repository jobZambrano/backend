const express = require('express');
const router = express.Router();
const CarreraModel = require('../models/carrera.model');

router.get('/', async (req, res) => {
  try {
    const carreras = await CarreraModel.getAll();
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const carrera = await CarreraModel.getById(req.params.id);
    if (!carrera) return res.status(404).json({ mensaje: 'Carrera no encontrada' });
    res.json(carrera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevaCarrera = await CarreraModel.create(req.body);
    res.status(201).json(nuevaCarrera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;