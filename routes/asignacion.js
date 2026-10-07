const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM asignacion WHERE idasignacion = ?', [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Asignacion no encontrada' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la asignacion' });
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
            whereClause = 'WHERE p.pro_apellidosNombres LIKE ? OR d.dem_nivel LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM asignacion a
            JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
            JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalAsignaciones = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaciones / limit);

        const asignacionesQuery = `
            SELECT a.*, p.pro_apellidosNombres, d.dem_nivel 
            FROM asignacion a
            JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
            JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        const queryParamsPaginados = [...queryParams, limit, offset];
        const [asignacionesResult] = await db.query(asignacionesQuery, queryParamsPaginados);

        res.json({
            totalItems: totalAsignaciones,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            data: asignacionesResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las asignaciones' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = req.body;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignacion WHERE profesores_idprofesores = ? AND demanda_iddemanda = ?', [profesores_idprofesores, demanda_iddemanda]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'La asignacion ya existe para este profesor y demanda' });
        }
        
        const [insertResult] = await db.query('INSERT INTO asignacion (profesores_idprofesores, demanda_iddemanda, asi_num_horas) VALUES (?, ?, ?)', [profesores_idprofesores, demanda_iddemanda, asi_num_horas]);
        res.status(201).json({
            message: 'Asignacion insertada correctamente',
            idasignacion: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar asignacion' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = req.body;
    try {
        const [result] = await db.query('UPDATE asignacion SET profesores_idprofesores = ?, demanda_iddemanda = ?, asi_num_horas = ? WHERE idasignacion = ?', [profesores_idprofesores, demanda_iddemanda, asi_num_horas, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Asignacion no encontrada" });
        res.status(200).json({ message: 'Asignacion actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar asignacion' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM asignacion WHERE idasignacion = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Asignacion no encontrada' });
        res.status(200).json({ mensaje: 'Asignacion eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar asignacion' });
    }
});

module.exports = router;