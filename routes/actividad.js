const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión a la base de datos

// ============================
// MODELO: Actividad
// Toda la lógica de acceso a la tabla `actividad`
// ============================
const ActividadModel = {
  // Trae todas las actividades
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM actividad');
    return rows;
  },

  // Busca una actividad puntual por su id
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM actividad WHERE idactividad = ?', [id]);
    return rows[0]; // solo esperamos un resultado
  },

  // Inserta una nueva actividad
  create: async (act_nombre) => {
    const [result] = await db.query('INSERT INTO actividad (act_nombre) VALUES (?)', [act_nombre]);
    return { idactividad: result.insertId, act_nombre };
  },

  // Actualiza el nombre de una actividad existente
  update: async (id, act_nombre) => {
    await db.query('UPDATE actividad SET act_nombre = ? WHERE idactividad = ?', [act_nombre, id]);
    return { idactividad: id, act_nombre };
  },

  // Elimina una actividad por id
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM actividad WHERE idactividad = ?', [id]);
    return result;
  }
};

// ============================
// RUTAS: /actividades
// ============================

// GET / -> lista todas las actividades
router.get('/', async (req, res) => {
  try {
    const actividades = await ActividadModel.getAll();
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id -> devuelve una actividad, o 404 si no existe
router.get('/:id', async (req, res) => {
  try {
    const actividad = await ActividadModel.getById(req.params.id);
    if (!actividad) return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    res.json(actividad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / -> crea una actividad nueva
router.post('/', async (req, res) => {
  try {
    const { act_nombre } = req.body;
    const nuevaActividad = await ActividadModel.create(act_nombre);
    res.status(201).json(nuevaActividad); // 201 = creado
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;