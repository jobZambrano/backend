const express = require('express');
const router = express.Router();
const ActividadModel = require('../models/actividad.model');
// Obtener todas las actividades
router.get('/', async (req, res) => {
  try {
    const actividades = await ActividadModel.getAll();
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Obtener una actividad por ID
router.get('/:id', async (req, res) => {
  try {
    const actividad = await ActividadModel.getById(req.params.id);
    if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    res.json(actividad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Crear una nueva actividad
router.post('/', async (req, res) => {
  try {
    const { act_nombre } = req.body;
    const nuevaActividad = await ActividadModel.create(act_nombre);
    res.status(201).json(nuevaActividad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;