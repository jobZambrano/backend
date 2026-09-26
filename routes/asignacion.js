const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM asignacion WHERE idasignacion = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener la asignacion' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Asignacion no encontrada' });
        }
        res.json(results[0]);
    });
});

//Metodo Get para multiples registros con paginacion y busquedad
router.get('/', verifyToken, (req, res) => {
    //Obtener parametros de la url
    const page = parseInt(req.query.page) || 1; //pagina actual por defecto 1
    const limit = parseInt(req.query.limit) || 10; //limites de registros, por defecto 10
    const offset = (page - 1) * limit; //el punto de inicio de la consulta
    const cadena = req.query.cadena;
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        //Buscar por nombre del profesor o nivel de demanda
        whereClause = 'WHERE p.pro_apellidosNombres LIKE ? OR d.dem_nivel LIKE ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm);
    }

    //consultas para obtener total registros
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM asignacion a
        JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
        JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
        ${whereClause}
    `;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de asignaciones' });
        }
        const totalAsignaciones = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaciones / limit);
        //consulta para obtener los registros de la pagina
        const asignacionesQuery = `
            SELECT a.*, p.pro_apellidosNombres, d.dem_nivel 
            FROM asignacion a
            JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
            JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);
        db.query(asignacionesQuery, queryParams, (err, asignacionesResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener las asignaciones' });
            }
            //Enviar respuesta con los datos y la informacion de paginación
            res.json({
                totalItems: totalAsignaciones,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: asignacionesResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken, (req, res) => {
    //obtener los datos
    const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = req.body;

    // Verificar si ya existe una asignacion con el mismo profesor y la misma demanda
    const search_query = 'SELECT COUNT(*) as contador FROM asignacion WHERE profesores_idprofesores = ? AND demanda_iddemanda = ?';
    db.query(search_query, [profesores_idprofesores, demanda_iddemanda], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la asignacion' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'La asignacion ya existe para este profesor y demanda' });
        }
        const query = 'INSERT INTO asignacion (profesores_idprofesores, demanda_iddemanda, asi_num_horas) VALUES (?, ?, ?)';
        const values = [profesores_idprofesores, demanda_iddemanda, asi_num_horas];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar asignacion' });
            }
            res.status(201).json({
                message: 'Asignacion insertada correctamente',
                idasignacion: result.insertId
            });
        });
    });
});

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = req.body;
    const query = 'UPDATE asignacion SET profesores_idprofesores = ?, demanda_iddemanda = ?, asi_num_horas = ? WHERE idasignacion = ?';
    const values = [profesores_idprofesores, demanda_iddemanda, asi_num_horas, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar asignacion' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Asignacion no encontrada" });
        }
        res.status(200).json({ message: 'Asignacion actualizada correctamente' });
    });
});

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // Se elimina directamente porque no se identifico una tabla que referencie a asignacion.
    // Si en el futuro existiera una tabla relacionada, se podria anadir la verificacion correspondiente.
    const query = 'DELETE FROM asignacion WHERE idasignacion = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al eliminar asignacion' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Asignacion no encontrada' });
        }
        res.status(200).json({ mensaje: 'Asignacion eliminada correctamente' });
    });
});

module.exports = router;