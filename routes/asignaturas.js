const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM asignaturas WHERE idasignaturas = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener la asignatura' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
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
        //Buscar por nombre de asignatura o nombre de carrera
        whereClause = 'WHERE a.asi_nombres LIKE ? OR c.car_nombre LIKE ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm);
    }

    //consultas para obtener total registros
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM asignaturas a
        JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
        ${whereClause}
    `;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de asignaturas' });
        }
        const totalAsignaturas = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaturas / limit);
        //consulta para obtener los registros de la pagina
        const asignaturasQuery = `
            SELECT a.*, c.car_nombre 
            FROM asignaturas a
            JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);
        db.query(asignaturasQuery, queryParams, (err, asignaturasResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener las asignaturas' });
            }
            //Enviar respuesta con los datos y la informacion de paginación
            res.json({
                totalItems: totalAsignaturas,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: asignaturasResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken, (req, res) => {
    //obtener los datos
    const { asi_nombres, carreras_idcarreras, asi_activa } = req.body;

    // Verificar si ya existe una asignatura con el mismo nombre en la misma carrera
    const search_query = 'SELECT COUNT(*) as contador FROM asignaturas WHERE asi_nombres = ? AND carreras_idcarreras = ?';
    db.query(search_query, [asi_nombres, carreras_idcarreras], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la asignatura' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'La asignatura ya existe para esta carrera' });
        }
        const query = 'INSERT INTO asignaturas (asi_nombres, carreras_idcarreras, asi_activa) VALUES (?, ?, ?)';
        const values = [asi_nombres, carreras_idcarreras, asi_activa ?? 1];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar asignatura' });
            }
            res.status(201).json({
                message: 'Asignatura insertada correctamente',
                idasignaturas: result.insertId
            });
        });
    });
});

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { asi_nombres, carreras_idcarreras, asi_activa } = req.body;
    const query = 'UPDATE asignaturas SET asi_nombres = ?, carreras_idcarreras = ?, asi_activa = ? WHERE idasignaturas = ?';
    const values = [asi_nombres, carreras_idcarreras, asi_activa, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar asignatura' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Asignatura no encontrada" });
        }
        res.status(200).json({ message: 'Asignatura actualizada correctamente' });
    });
});

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // Verificamos si la asignatura está siendo usada en 'demanda' (por la relación asignaturas_idasignaturas)
    const search_query = 'SELECT COUNT(*) as contador FROM demanda WHERE asignaturas_idasignaturas = ?';
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la demanda' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Asignatura no se puede eliminar porque tiene demandas registradas' });
        }
        const query = 'DELETE FROM asignaturas WHERE idasignaturas = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar asignatura' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
            }
            res.status(200).json({ mensaje: 'Asignatura eliminada correctamente' });
        });
    });
});

module.exports = router;