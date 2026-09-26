const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM asignacion_actividad WHERE idasignacion_actividad = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener la asignacion de actividad' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Asignacion de actividad no encontrada' });
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
        //Buscar por nombre de periodo, nombre de actividad o nombre del profesor
        whereClause = 'WHERE p.per_nombre LIKE ? OR act.act_nombre LIKE ? OR prof.pro_apellidosNombres LIKE ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    //consultas para obtener total registros
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM asignacion_actividad aa
        JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
        JOIN actividad act ON aa.actividad_idactividad = act.idactividad
        JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
        ${whereClause}
    `;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de asignaciones de actividad' });
        }
        const totalAsignaciones = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaciones / limit);
        //consulta para obtener los registros de la pagina
        const asignacionesQuery = `
            SELECT aa.*, p.per_nombre, act.act_nombre, prof.pro_apellidosNombres
            FROM asignacion_actividad aa
            JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
            JOIN actividad act ON aa.actividad_idactividad = act.idactividad
            JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);
        db.query(asignacionesQuery, queryParams, (err, asignacionesResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener las asignaciones de actividad' });
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
    const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = req.body;

    // Verificar si ya existe una asignacion con la misma combinacion de periodo, actividad y profesor
    const search_query = 'SELECT COUNT(*) as contador FROM asignacion_actividad WHERE periodos_idperiodos = ? AND actividad_idactividad = ? AND profesores_idprofesores = ?';
    db.query(search_query, [periodos_idperiodos, actividad_idactividad, profesores_idprofesores], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la asignacion de actividad' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'La asignacion de actividad ya existe para este periodo, actividad y profesor' });
        }
        const query = 'INSERT INTO asignacion_actividad (periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas) VALUES (?, ?, ?, ?)';
        const values = [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar asignacion de actividad' });
            }
            res.status(201).json({
                message: 'Asignacion de actividad insertada correctamente',
                idasignacion_actividad: result.insertId
            });
        });
    });
});

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = req.body;
    const query = 'UPDATE asignacion_actividad SET periodos_idperiodos = ?, actividad_idactividad = ?, profesores_idprofesores = ?, act_num_horas = ? WHERE idasignacion_actividad = ?';
    const values = [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar asignacion de actividad' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Asignacion de actividad no encontrada" });
        }
        res.status(200).json({ message: 'Asignacion de actividad actualizada correctamente' });
    });
});

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // Se elimina directamente porque no se identifico una tabla que referencie a asignacion_actividad.
    // Si en el futuro existiera una tabla relacionada, se podria anadir la verificacion correspondiente.
    const query = 'DELETE FROM asignacion_actividad WHERE idasignacion_actividad = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al eliminar asignacion de actividad' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Asignacion de actividad no encontrada' });
        }
        res.status(200).json({ mensaje: 'Asignacion de actividad eliminada correctamente' });
    });
});

module.exports = router;