const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM carreras WHERE idcarreras = ?', [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Carrera no encontrada' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la carrera' });
    }
});

router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const cadena = req.query.cadena;
        
        let whereClause = '';
        let queryParams = [];
        if (cadena) {
            whereClause = 'WHERE car_nombre LIKE ? OR car_alias LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM carreras ${whereClause}`, queryParams);
        const totalCarreras = countResult[0].total;
        const totalPages = Math.ceil(totalCarreras / limit);

        const queryParamsPaginados = [...queryParams, limit, offset];
        const [carrerasResult] = await db.query(`SELECT * FROM carreras ${whereClause} LIMIT ? OFFSET ?`, queryParamsPaginados);

        res.json({
            totalItems: totalCarreras,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            data: carrerasResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las carreras' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { car_nombre, car_alias } = req.body;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM carreras WHERE car_nombre = ?', [car_nombre]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'La carrera con nombre ' + car_nombre + ' ya existe' });
        }
        
        const [insertResult] = await db.query('INSERT INTO carreras (car_nombre, car_alias) VALUES (?, ?)', [car_nombre, car_alias]);
        res.status(201).json({
            message: 'Carrera insertada correctamente',
            idcarreras: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar carrera' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { car_nombre, car_alias } = req.body;
    try {
        const [result] = await db.query('UPDATE carreras SET car_nombre = ?, car_alias = ? WHERE idcarreras = ?', [car_nombre, car_alias, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Carrera no encontrada" });
        res.status(200).json({ message: 'Carrera actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar carrera' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignaturas WHERE carreras_idcarreras = ?', [id]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Carrera no se puede eliminar porque tiene asignaturas registradas' });
        }
        
        const [deleteResult] = await db.query('DELETE FROM carreras WHERE idcarreras = ?', [id]);
        if (deleteResult.affectedRows === 0) return res.status(404).json({ mensaje: 'Carrera no encontrada' });
        
        res.status(200).json({ mensaje: 'Carrera eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar carrera' });
    }
});

module.exports = router;