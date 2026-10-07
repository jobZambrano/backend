const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM demanda WHERE iddemanda = ?', [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Demanda no encontrada' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la demanda' });
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
            whereClause = 'WHERE dem_nivel LIKE ?';
            queryParams.push(`%${cadena}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM demanda ${whereClause}`, queryParams);
        const totalDemandas = countResult[0].total;
        const totalPages = Math.ceil(totalDemandas / limit);

        const queryParamsPaginados = [...queryParams, limit, offset];
        const [demandasResult] = await db.query(`SELECT * FROM demanda ${whereClause} LIMIT ? OFFSET ?`, queryParamsPaginados);

        res.json({
            totalItems: totalDemandas,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            data: demandasResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las demandas' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos } = req.body;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM demanda WHERE carreras_idcarreras = ? AND periodos_idperiodos = ? AND asignaturas_idasignaturas = ?', [carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'La demanda ya existe para esta carrera, periodo y asignatura' });
        }
        
        const [insertResult] = await db.query('INSERT INTO demanda VALUES(null,?,?,?,?,?,?,?)', [carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos]);
        res.status(201).json({
            message: 'Demanda insertada correctamente', 
            iddemanda: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar demanda' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos } = req.body;
    try {
        const [result] = await db.query('UPDATE demanda SET carreras_idcarreras = ?, periodos_idperiodos = ?, asignaturas_idasignaturas = ?, dem_nivel = ?, dem_num_hor_clase = ?, dem_num_estudiantes = ?, dem_num_paralelos = ? WHERE iddemanda = ?', [carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Demanda no encontrada" });
        res.status(200).json({ message: 'Demanda actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar demanda' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignacion_actividad WHERE demanda_iddemanda = ?', [id]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Demanda no se puede eliminar porque tiene una asignacion de actividad registrada' });
        }
        
        const [deleteResult] = await db.query('DELETE FROM demanda WHERE iddemanda = ?', [id]);
        if (deleteResult.affectedRows === 0) return res.status(404).json({ mensaje: 'Demanda no encontrada' });
        
        res.status(200).json({ mensaje: 'Demanda eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar demanda' });
    }
});

module.exports = router;