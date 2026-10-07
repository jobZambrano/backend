const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM asignaturas WHERE idasignaturas = ?', [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Asignatura no encontrada' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la asignatura' });
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
            whereClause = 'WHERE a.asi_nombres LIKE ? OR c.car_nombre LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM asignaturas a
            JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalAsignaturas = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaturas / limit);

        const asignaturasQuery = `
            SELECT a.*, c.car_nombre 
            FROM asignaturas a
            JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        const queryParamsPaginados = [...queryParams, limit, offset];
        const [asignaturasResult] = await db.query(asignaturasQuery, queryParamsPaginados);

        res.json({
            totalItems: totalAsignaturas,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            data: asignaturasResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las asignaturas' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { asi_nombres, carreras_idcarreras, asi_activa } = req.body;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignaturas WHERE asi_nombres = ? AND carreras_idcarreras = ?', [asi_nombres, carreras_idcarreras]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'La asignatura ya existe para esta carrera' });
        }
        
        const [insertResult] = await db.query('INSERT INTO asignaturas (asi_nombres, carreras_idcarreras, asi_activa) VALUES (?, ?, ?)', [asi_nombres, carreras_idcarreras, asi_activa ?? 1]);
        res.status(201).json({
            message: 'Asignatura insertada correctamente',
            idasignaturas: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar asignatura' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { asi_nombres, carreras_idcarreras, asi_activa } = req.body;
    try {
        const [result] = await db.query('UPDATE asignaturas SET asi_nombres = ?, carreras_idcarreras = ?, asi_activa = ? WHERE idasignaturas = ?', [asi_nombres, carreras_idcarreras, asi_activa, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Asignatura no encontrada" });
        res.status(200).json({ message: 'Asignatura actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar asignatura' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM demanda WHERE asignaturas_idasignaturas = ?', [id]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Asignatura no se puede eliminar porque tiene demandas registradas' });
        }
        
        const [deleteResult] = await db.query('DELETE FROM asignaturas WHERE idasignaturas = ?', [id]);
        if (deleteResult.affectedRows === 0) return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
        
        res.status(200).json({ mensaje: 'Asignatura eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar asignatura' });
    }
});

module.exports = router;