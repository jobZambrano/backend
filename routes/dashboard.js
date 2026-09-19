const express = require("express");
const router = express.Router();
const db = require("../db");

// --- CONSULTAS (GET) ---

// Obtener totales de carreras, profesores y asignaturas (dashboard.php)
const getTotales = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM carreras) AS Carreras,
      (SELECT COUNT(*) FROM profesores) AS Profesores,
      (SELECT COUNT(*) FROM asignaturas) AS Asignaturas
  `;
  const [rows] = await db.query(query);
  return rows[0];
};

// Obtener últimas 4 asignaturas (dashasignatura.php)
const getUltimasAsignaturas = async () => {
  const query = "SELECT * FROM asignaturas ORDER BY idasignaturas DESC LIMIT 4";
  const [rows] = await db.query(query);
  return rows;
};

// Obtener últimas 4 carreras (dashcarrera.php)
const getUltimasCarreras = async () => {
  const query = "SELECT * FROM carreras ORDER BY idcarreras DESC LIMIT 4";
  const [rows] = await db.query(query);
  return rows;
};

// --- RUTAS (EXPRESS) ---

// Endpoint: Totales
router.get("/totales", async (req, res) => {
  try {
    const totales = await getTotales();
    res.json(totales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Últimas asignaturas
router.get("/asignaturas", async (req, res) => {
  try {
    const asignaturas = await getUltimasAsignaturas();
    res.json(asignaturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Últimas carreras
router.get("/carreras", async (req, res) => {
  try {
    const carreras = await getUltimasCarreras();
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
