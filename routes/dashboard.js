const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para totales (dashboard)
router.get('/totales', verifyToken, async (req, res) => { // <-- Agregado async
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM carreras) AS Carreras,
            (SELECT COUNT(*) FROM profesores) AS Profesores,
            (SELECT COUNT(*) FROM asignaturas) AS Asignaturas
    `;
    try {
        const [results] = await db.query(query); // <-- Usando await y desestructuración
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los totales' });
    }
});

//metodo get para las ultimas asignaturas (dashboard)
router.get('/asignaturas', verifyToken, async (req, res) => { // <-- Agregado async
    const query = 'SELECT * FROM asignaturas ORDER BY idasignaturas DESC LIMIT 4';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las ultimas asignaturas' });
    }
});

//metodo get para las ultimas carreras (dashboard)
router.get('/carreras', verifyToken, async (req, res) => { // <-- Agregado async
    const query = 'SELECT * FROM carreras ORDER BY idcarreras DESC LIMIT 4';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las ultimas carreras' });
    }
});

module.exports = router;