const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para totales (dashboard)
router.get('/totales', verifyToken, (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM carreras) AS Carreras,
            (SELECT COUNT(*) FROM profesores) AS Profesores,
            (SELECT COUNT(*) FROM asignaturas) AS Asignaturas
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener los totales' });
        }
        res.json(results[0]);
    });
});

//metodo get para las ultimas asignaturas (dashboard)
router.get('/asignaturas', verifyToken, (req, res) => {
    const query = 'SELECT * FROM asignaturas ORDER BY idasignaturas DESC LIMIT 4';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener las ultimas asignaturas' });
        }
        res.json(results);
    });
});

//metodo get para las ultimas carreras (dashboard)
router.get('/carreras', verifyToken, (req, res) => {
    const query = 'SELECT * FROM carreras ORDER BY idcarreras DESC LIMIT 4';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener las ultimas carreras' });
        }
        res.json(results);
    });
});

module.exports = router;