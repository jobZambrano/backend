const express = require("express");
const router = express.Router();
const db = require("../db");

// ============================
// MODELO: Coordinador
// ============================
const CoordinadorModel = {
  // Trae todos los coordinadores con nombre del profesor y de la carrera (doble JOIN)
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT co.*, p.pro_apellidosNombres, c.car_nombre 
      FROM coordinadores co
      JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
      JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
    `);
    return rows;
  },

  // Busca un coordinador por id get-crear
  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM coordinadores WHERE idcoordinadores = ?",
      [id],
    );
    return rows[0];
  },

  // Crea un coordinador (profesor + carrera + rol)
  create: async (data) => {
    const { profesores_idprofesores, carreras_idcarreras, coo_rol } = data;
    const [result] = await db.query(
      "INSERT INTO coordinadores (profesores_idprofesores, carreras_idcarreras, coo_rol) VALUES (?, ?, ?)",
      [profesores_idprofesores, carreras_idcarreras, coo_rol],
    );
    return { idcoordinadores: result.insertId, ...data };
  },
};

// ============================
// RUTAS: /coordinadores
// ============================

// GET / -> lista todos los coordinadores
router.get("/", async (req, res) => {
  try {
    const coordinadores = await CoordinadorModel.getAll();
    res.json(coordinadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST / -> crea un coordinador nuevo
router.post("/", async (req, res) => {
  try {
    const nuevoCoordinador = await CoordinadorModel.create(req.body);
    res.status(201).json(nuevoCoordinador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
