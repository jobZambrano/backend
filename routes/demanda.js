const express = require('express');
const router = express.Router();
const db = require('../db');

// --- CONSULTAS (GET) ---

// Obtener demandas filtradas por profesor/coordinador (demanda.php)
const getAllDemandas = async (profesorId) => {
  const query = `
    SELECT 
      d.iddemanda, 
      d.carreras_idcarreras, 
      d.periodos_idperiodos,
      d.asignaturas_idasignaturas,
      d.dem_nivel,
      d.dem_num_hor_clase,
      d.dem_num_estudiantes,
      d.dem_num_paralelos,
      c.car_nombre AS nombre_carrera, 
      p.per_nombre AS nombre_periodo,
      a.asi_nombres AS nombre_asignatura
    FROM demanda d
    INNER JOIN carreras c ON d.carreras_idcarreras = c.idcarreras
    INNER JOIN periodos p ON d.periodos_idperiodos = p.idperiodos 
    INNER JOIN asignaturas a ON d.asignaturas_idasignaturas = a.idasignaturas 
    INNER JOIN coordinadores co ON c.idcarreras = co.carreras_idcarreras
    WHERE co.profesores_idprofesores = ? AND co.coo_rol = 'COORDINADOR'
    ORDER BY d.iddemanda DESC
  `;
  const [rows] = await db.query(query, [profesorId]);
  return rows;
};

// Obtener asignaturas filtradas por profesor/coordinador (dem_asignatura.php)
const getAsignaturasByProfesor = async (profesorId) => {
  const query = `
    SELECT a.* 
    FROM asignaturas a
    JOIN coordinadores co ON a.carreras_idcarreras = co.carreras_idcarreras
    WHERE co.profesores_idprofesores = ? AND co.coo_rol = 'COORDINADOR'
  `;
  const [rows] = await db.query(query, [profesorId]);
  return rows;
};

// Obtener carreras filtradas por profesor/coordinador (dem_carrera.php)
const getCarrerasByProfesor = async (profesorId) => {
  const query = `
    SELECT c.* 
    FROM carreras c
    JOIN coordinadores co ON c.idcarreras = co.carreras_idcarreras
    WHERE co.profesores_idprofesores = ? AND co.coo_rol = 'COORDINADOR'
  `;
  const [rows] = await db.query(query, [profesorId]);
  return rows;
};

// Obtener periodos activos/generales (dem_periodo.php)
const getPeriodos = async () => {
  const query = 'SELECT * FROM periodos ORDER BY idperiodos DESC';
  const [rows] = await db.query(query);
  return rows;
};

// --- RUTAS (EXPRESS) ---

// Endpoint: Lista de demandas del coordinador
router.get('/', async (req, res) => {
  try {
    const profesorId = req.query.profesor_id;
    if (!profesorId) return res.status(400).json({ error: 'Falta el parámetro profesor_id' });

    const result = await getAllDemandas(profesorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Asignaturas del coordinador para la demanda
router.get('/asignaturas', async (req, res) => {
  try {
    const profesorId = req.query.profesor_id;
    if (!profesorId) return res.status(400).json({ error: 'Falta el parámetro profesor_id' });

    const result = await getAsignaturasByProfesor(profesorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Carreras del coordinador para la demanda
router.get('/carreras', async (req, res) => {
  try {
    const profesorId = req.query.profesor_id;
    if (!profesorId) return res.status(400).json({ error: 'Falta el parámetro profesor_id' });

    const result = await getCarrerasByProfesor(profesorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Lista de periodos
router.get('/periodos', async (req, res) => {
  try {
    const result = await getPeriodos();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;