const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM coordinadores WHERE idcoordinadores = ?', [id]);
        if (results.length === 0) return res.status(404).json({ error: 'Coordinador no encontrado' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el coordinador' });
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
            whereClause = 'WHERE p.pro_apellidosNombres LIKE ? OR c.car_nombre LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM coordinadores co
            JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
            JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalCoordinadores = countResult[0].total;
        const totalPages = Math.ceil(totalCoordinadores / limit);

        const coordinadoresQuery = `
            SELECT co.*, p.pro_apellidosNombres, c.car_nombre 
            FROM coordinadores co
            JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
            JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        const queryParamsPaginados = [...queryParams, limit, offset];
        const [coordinadoresResult] = await db.query(coordinadoresQuery, queryParamsPaginados);

        res.json({
            totalItems: totalCoordinadores,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            data: coordinadoresResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los coordinadores' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    const { profesores_idprofesores, carreras_idcarreras, coo_rol } = req.body;
    try {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM coordinadores WHERE profesores_idprofesores = ? AND carreras_idcarreras = ? AND coo_rol = ?', [profesores_idprofesores, carreras_idcarreras, coo_rol]);
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'El coordinador ya existe para este profesor, carrera y rol' });
        }
        
        const [insertResult] = await db.query('INSERT INTO coordinadores (profesores_idprofesores, carreras_idcarreras, coo_rol) VALUES (?, ?, ?)', [profesores_idprofesores, carreras_idcarreras, coo_rol]);
        res.status(201).json({
            message: 'Coordinador insertado correctamente',
            idcoordinadores: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar coordinador' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { profesores_idprofesores, carreras_idcarreras, coo_rol } = req.body;
    try {
        const [result] = await db.query('UPDATE coordinadores SET profesores_idprofesores = ?, carreras_idcarreras = ?, coo_rol = ? WHERE idcoordinadores = ?', [profesores_idprofesores, carreras_idcarreras, coo_rol, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Coordinador no encontrado" });
        res.status(200).json({ message: 'Coordinador actualizado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar coordinador' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM coordinadores WHERE idcoordinadores = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Coordinador no encontrado' });
        res.status(200).json({ mensaje: 'Coordinador eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar coordinador' });
    }
});

module.exports = router;