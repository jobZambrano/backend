const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================
// MODELO: Asignaturas
// ============================
const AsignaturaModel = {
  // Trae todas las asignaturas junto con el nombre de su carrera (JOIN)
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT a.*, c.car_nombre 
      FROM asignaturas a
      JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
    `);
    return rows;
  },

  // Busca una asignaturas por id
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM asignaturas WHERE idasignaturas = ?', [id]);
    return rows[0];
  },

  // Crea una asignatura; si no envías "asi_activa", se guarda activa (1) por defecto
  create: async (data) => {
    const { asi_nombres, carreras_idcarreras, asi_activa } = data;
    const [result] = await db.query(
      'INSERT INTO asignaturas (asi_nombres, carreras_idcarreras, asi_activa) VALUES (?, ?, ?)',
      [asi_nombres, carreras_idcarreras, asi_activa ?? 1]
    );
    return { idasignaturas: result.insertId, ...data };
  }
};

// ============================
// RUTAS: /asignaturas
// ============================

// GET / -> lista todas las asignaturas
router.get('/', async (req, res) => {
  try {
    const asignaturas = await AsignaturaModel.getAll();
    res.json(asignaturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / -> crea una asignatura nueva
router.post('/', async (req, res) => {
  try {
    const nuevaAsignatura = await AsignaturaModel.create(req.body);
    res.status(201).json(nuevaAsignatura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;