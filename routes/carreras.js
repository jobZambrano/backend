const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM carreras WHERE idcarreras = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener la carrera' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
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
        //Buscar por nombre o alias de la carrera
        whereClause = 'WHERE car_nombre LIKE ? OR car_alias LIKE ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm);
    }

    //consultas para obtener total registros
    const countQuery = `SELECT COUNT(*) as total FROM carreras ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de carreras' });
        }
        const totalCarreras = countResult[0].total;
        const totalPages = Math.ceil(totalCarreras / limit);
        //consulta para obtener los registros de la pagina
        const carrerasQuery = `SELECT * FROM carreras ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(carrerasQuery, queryParams, (err, carrerasResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener las carreras' });
            }
            //Enviar respuesta con los datos y la informacion de paginación
            res.json({
                totalItems: totalCarreras,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: carrerasResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken, (req, res) => {
    //obtener los datos
    const { car_nombre, car_alias } = req.body;

    // Verificar si ya existe una carrera con el mismo nombre
    const search_query = 'SELECT COUNT(*) as contador FROM carreras WHERE car_nombre = ?';
    db.query(search_query, [car_nombre], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la carrera' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'La carrera con nombre ' + car_nombre + ' ya existe' });
        }
        const query = 'INSERT INTO carreras (car_nombre, car_alias) VALUES (?, ?)';
        const values = [car_nombre, car_alias];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar carrera' });
            }
            res.status(201).json({
                message: 'Carrera insertada correctamente',
                idcarreras: result.insertId
            });
        });
    });
});

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { car_nombre, car_alias } = req.body;
    const query = 'UPDATE carreras SET car_nombre = ?, car_alias = ? WHERE idcarreras = ?';
    const values = [car_nombre, car_alias, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar carrera' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Carrera no encontrada" });
        }
        res.status(200).json({ message: 'Carrera actualizada correctamente' });
    });
});

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // Verificamos si la carrera está siendo usada en 'asignaturas' (por la relación carreras_idcarreras)
    const search_query = 'SELECT COUNT(*) as contador FROM asignaturas WHERE carreras_idcarreras = ?';
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la asignatura' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Carrera no se puede eliminar porque tiene asignaturas registradas' });
        }
        const query = 'DELETE FROM carreras WHERE idcarreras = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar carrera' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Carrera no encontrada' });
            }
            res.status(200).json({ mensaje: 'Carrera eliminada correctamente' });
        });
    });
});

module.exports = router;