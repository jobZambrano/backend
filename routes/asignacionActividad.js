const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================
// MODELO: Asignación de Actividad (profesor + actividad + periodo)
// ============================
const AsignacionActividadModel = {
  // Trae todas las asignaciones de actividad con nombre del periodo,
  // nombre de la actividad y nombre del profesor (JOIN triple)
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT aa.*, p.per_nombre, act.act_nombre, prof.pro_apellidosNombres
      FROM asignacion_actividad aa
      JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
      JOIN actividad act ON aa.actividad_idactividad = act.idactividad
      JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
    `);
    return rows;
  },

  // Crea una asignación de actividad para un profesor en un periodo
  create: async (data) => {
    const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = data;
    const [result] = await db.query(
      'INSERT INTO asignacion_actividad (periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas) VALUES (?, ?, ?, ?)',
      [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas]
    );
    return { idasignacion_actividad: result.insertId, ...data };
  }
};

// ============================
// RUTAS: /asignacion-actividad
// ============================

// GET / -> lista todas las asignaciones de actividad
router.get('/', async (req, res) => {
  try {
    const asignaciones = await AsignacionActividadModel.getAll();
    res.json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / -> crea una asignación de actividad nueva
router.post('/', async (req, res) => {
  try {
    const nuevaAsignacion = await AsignacionActividadModel.create(req.body);
    res.status(201).json(nuevaAsignacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;