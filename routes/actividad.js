const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM actividad WHERE idactividad = ?', [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la actividad' });
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
            whereClause = 'WHERE act_nombre LIKE ?';
            queryParams.push(`%${cadena}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM actividad ${whereClause}`, queryParams);
        const totalActividades = countResult[0].total;
        const totalPages = Math.ceil(totalActividades / limit);

        const queryParamsPaginados = [...queryParams, limit, offset];
        const [actividadesResult] = await db.query(`SELECT * FROM actividad ${whereClause} LIMIT ? OFFSET ?`, queryParamsPaginados);

        res.json({
            totalItems: totalActividades,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            data: actividadesResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las actividades' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { act_nombre } = req.body;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM actividad WHERE act_nombre = ?', [act_nombre]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'La actividad con nombre ' + act_nombre + ' ya existe' });
        }
        
        const [insertResult] = await db.query('INSERT INTO actividad (act_nombre) VALUES (?)', [act_nombre]);
        res.status(201).json({
            message: 'Actividad insertada correctamente',
            idactividad: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar actividad' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { act_nombre } = req.body;
    try {
        const [result] = await db.query('UPDATE actividad SET act_nombre = ? WHERE idactividad = ?', [act_nombre, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Actividad no encontrada" });
        res.status(200).json({ message: 'Actividad actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar actividad' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignacion_actividad WHERE actividad_idactividad = ?', [id]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Actividad no se puede eliminar porque tiene asignaciones registradas' });
        }
        
        const [deleteResult] = await db.query('DELETE FROM actividad WHERE idactividad = ?', [id]);
        if (deleteResult.affectedRows === 0) return res.status(404).json({ mensaje: 'Actividad no encontrada' });
        
        res.status(200).json({ mensaje: 'Actividad eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar actividad' });
    }
});

module.exports = router;