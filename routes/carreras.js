const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================
// MODELO: Carreras
// ============================
const CarreraModel = {
  // Trae todas las carreras
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM carreras');
    return rows;
  },

  // Busca una carrera por id
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM carreras WHERE idcarreras = ?', [id]);
    return rows[0];
  },

  // Crea una carrera nueva (nombre + alias)
  create: async (data) => {
    const { car_nombre, car_alias } = data;
    const [result] = await db.query(
      'INSERT INTO carreras (car_nombre, car_alias) VALUES (?, ?)',
      [car_nombre, car_alias]
    );
    return { idcarreras: result.insertId, car_nombre, car_alias };
  }
};

// ============================
// RUTAS: /carreras
// ============================

// GET / -> lista todas las carreras
router.get('/', async (req, res) => {
  try {
    const carreras = await CarreraModel.getAll();
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id -> devuelve una carrera, o 404 si no existe
router.get('/:id', async (req, res) => {
  try {
    const carrera = await CarreraModel.getById(req.params.id);
    if (!carrera) return res.status(404).json({ mensaje: 'Carrera no encontrada' });
    res.json(carrera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / -> crea una carrera nueva
router.post('/', async (req, res) => {
  try {
    const nuevaCarrera = await CarreraModel.create(req.body);
    res.status(201).json(nuevaCarrera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;