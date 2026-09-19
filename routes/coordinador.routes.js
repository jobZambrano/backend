const express = require('express');
const router = express.Router();
const CoordinadorModel = require('../models/coordinador.model');

router.get('/', async (req, res) => {
  try {
    const coordinadores = await CoordinadorModel.getAll();
    res.json(coordinadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const nuevoCoordinador = await CoordinadorModel.create(req.body);
    res.status(201).json(nuevoCoordinador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;