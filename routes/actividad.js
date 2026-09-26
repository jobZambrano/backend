const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM actividad WHERE idactividad = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener la actividad' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
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
        //Buscar por nombre de la actividad
        whereClause = 'WHERE act_nombre LIKE ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm);
    }

    //consultas para obtener total registros
    const countQuery = `SELECT COUNT(*) as total FROM actividad ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de actividades' });
        }
        const totalActividades = countResult[0].total;
        const totalPages = Math.ceil(totalActividades / limit);
        //consulta para obtener los registros de la pagina
        const actividadesQuery = `SELECT * FROM actividad ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(actividadesQuery, queryParams, (err, actividadesResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener las actividades' });
            }
            //Enviar respuesta con los datos y la informacion de paginación
            res.json({
                totalItems: totalActividades,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: actividadesResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken, (req, res) => {
    //obtener los datos
    const { act_nombre } = req.body;

    // Verificar si ya existe una actividad con el mismo nombre
    const search_query = 'SELECT COUNT(*) as contador FROM actividad WHERE act_nombre = ?';
    db.query(search_query, [act_nombre], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la actividad' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'La actividad con nombre ' + act_nombre + ' ya existe' });
        }
        const query = 'INSERT INTO actividad (act_nombre) VALUES (?)';
        const values = [act_nombre];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar actividad' });
            }
            res.status(201).json({
                message: 'Actividad insertada correctamente',
                idactividad: result.insertId
            });
        });
    });
});

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { act_nombre } = req.body;
    const query = 'UPDATE actividad SET act_nombre = ? WHERE idactividad = ?';
    const values = [act_nombre, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar actividad' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Actividad no encontrada" });
        }
        res.status(200).json({ message: 'Actividad actualizada correctamente' });
    });
});

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // Verificamos si la actividad está siendo usada en 'asignacion_actividad' (por la relación actividad_idactividad)
    const search_query = 'SELECT COUNT(*) as contador FROM asignacion_actividad WHERE actividad_idactividad = ?';
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la asignacion de actividad' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Actividad no se puede eliminar porque tiene asignaciones registradas' });
        }
        const query = 'DELETE FROM actividad WHERE idactividad = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar actividad' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Actividad no encontrada' });
            }
            res.status(200).json({ mensaje: 'Actividad eliminada correctamente' });
        });
    });
});

module.exports = router;