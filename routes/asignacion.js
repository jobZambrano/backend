const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================
// MODELO: Asignación (profesor ↔ demanda)
// ============================
const AsignacionModel = {
  // Trae todas las asignaciones con nombre del profesor y nivel de demanda (JOIN)
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT a.*, p.pro_apellidosNombres, d.dem_nivel 
      FROM asignacion a
      JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
      JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
    `);
    return rows;
  },

  // Busca una asignación por id (sin JOIN)
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM asignacion WHERE idasignacion = ?', [id]);
    return rows[0];
  },

  // Crea una asignación: profesor + demanda + horas
  create: async (data) => {
    const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = data;
    const [result] = await db.query(
      'INSERT INTO asignacion (profesores_idprofesores, demanda_iddemanda, asi_num_horas) VALUES (?, ?, ?)',
      [profesores_idprofesores, demanda_iddemanda, asi_num_horas]
    );
    return { idasignacion: result.insertId, ...data };
  },

  // Elimina una asignación por id
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM asignacion WHERE idasignacion = ?', [id]);
    return result;
  }
};

// ============================
// RUTAS: /asignaciones
// ============================

// GET / -> lista todas las asignaciones
router.get('/', async (req, res) => {
  try {
    const asignaciones = await AsignacionModel.getAll();
    res.json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / -> crea una asignación nueva
router.post('/', async (req, res) => {
  try {
    const nuevaAsignacion = await AsignacionModel.create(req.body);
    res.status(201).json(nuevaAsignacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;