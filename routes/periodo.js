const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM periodos WHERE idperiodos =?;'
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: ' Error al obtener el periodo' })
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Periodo no encontrado' })
        }
        res.json(results[0]);
    });
});

//Metodo Get para multiples registros con paginacion y busquedad
router.get('/', verifyToken, (req, res) => {
    //Obtener parametros de la url
    const page = parseInt(req.query.page) || 1; //pagina actual por defecto 1
    const limit = parseInt(req.query.limit) || 10;// limites de registros, por defecto 10
    const offset = (page - 1) * limit;// el punto de inicio de la consulta
    const cadena = req.query.cadena;
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        whereClause = 'where per_nombre like ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm);

    }

    //consultas para obtener total registros
    const countQuery = `select count(*) as total from periodos ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de periodos' });
        }
        const totalPeriodos = countResult[0].total;
        const totalPages = Math.ceil(totalPeriodos / limit);
        //consulta par obtener los registros de la pagina 
        const periodosQuery = `select * from periodos ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(periodosQuery, queryParams, (err, periodosResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Errror al obtener los periodos' });
            }
            //Enviar respuesta on los datos y la informacion de paginación
            res.json({
                totalItems: totalPeriodos,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: periodosResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken, (req, res) => {
    //obtener los datos
    const { per_nombre, per_activa, per_mostrar } = req.body;
    const search_query = 'select count(*) as contador from periodos where per_nombre = ?';
    db.query(search_query, [per_nombre], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar el periodo' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'El periodo con nombre ' + per_nombre + ' ya existe' })
        }
        const query = 'INSERT INTO periodos VALUES(null,?,?,?)';
        const values = [per_nombre, per_activa, per_mostrar];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar periodo' });
            }
            res.status(201).json({
                message: 'Periodo insertado correctamente', idperiodos: result.insertId
            })
        })
    })


})

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { per_nombre, per_activa, per_mostrar} = req.body;
    const query = 'update periodos set per_nombre = ?, per_activa = ?, per_mostrar = ? WHERE idperiodos = ?';
    const values = [per_nombre, per_activa, per_mostrar, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar periodo' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Periodo no encontrado" })
        }
        res.status(200).json({ message: 'Periodo actualizado correctamente' })
    })
})

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // Aquí verifiqué si el periodo está siendo usado en la tabla 'demanda' (por la relación periodos_idperiodos)
    const search_query = 'select count(*) as contador from demanda where periodos_idperiodos = ? '
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la demanda' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Periodo no se puede eliminar por que tiene una demanda registrada' })
        }
        const query = 'DELETE FROM periodos WHERE idperiodos = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar periodo' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Periodo no encontrado' });
            }
            res.status(200).json({ mensaje: 'Periodo eliminado correctamente' });
        });
    })


});
module.exports = router;