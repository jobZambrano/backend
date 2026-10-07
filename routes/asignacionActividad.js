const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM asignacion_actividad WHERE idasignacion_actividad = ?', [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Asignacion de actividad no encontrada' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la asignacion de actividad' });
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
            whereClause = 'WHERE p.per_nombre LIKE ? OR act.act_nombre LIKE ? OR prof.pro_apellidosNombres LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM asignacion_actividad aa
            JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
            JOIN actividad act ON aa.actividad_idactividad = act.idactividad
            JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalAsignaciones = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaciones / limit);

        const asignacionesQuery = `
            SELECT aa.*, p.per_nombre, act.act_nombre, prof.pro_apellidosNombres
            FROM asignacion_actividad aa
            JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
            JOIN actividad act ON aa.actividad_idactividad = act.idactividad
            JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
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
        res.status(500).json({ error: 'Error al obtener las asignaciones de actividad' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = req.body;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignacion_actividad WHERE periodos_idperiodos = ? AND actividad_idactividad = ? AND profesores_idprofesores = ?', [periodos_idperiodos, actividad_idactividad, profesores_idprofesores]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'La asignacion de actividad ya existe para este periodo, actividad y profesor' });
        }
        
        const [insertResult] = await db.query('INSERT INTO asignacion_actividad (periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas) VALUES (?, ?, ?, ?)', [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas]);
        res.status(201).json({
            message: 'Asignacion de actividad insertada correctamente',
            idasignacion_actividad: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar asignacion de actividad' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = req.body;
    try {
        const [result] = await db.query('UPDATE asignacion_actividad SET periodos_idperiodos = ?, actividad_idactividad = ?, profesores_idprofesores = ?, act_num_horas = ? WHERE idasignacion_actividad = ?', [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Asignacion de actividad no encontrada" });
        res.status(200).json({ message: 'Asignacion de actividad actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar asignacion de actividad' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM asignacion_actividad WHERE idasignacion_actividad = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Asignacion de actividad no encontrada' });
        res.status(200).json({ mensaje: 'Asignacion de actividad eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar asignacion de actividad' });
    }
});

module.exports = router;