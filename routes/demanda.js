const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM demanda WHERE iddemanda =?;'
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: ' Error al obtener la demanda' })
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Demanda no encontrada' })
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
        // Busca por nivel de demanda (o el campo de texto que prefieras)
        whereClause = 'where dem_nivel like ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm);

    }

    //consultas para obtener total registros
    const countQuery = `select count(*) as total from demanda ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de demandas' });
        }
        const totalDemandas = countResult[0].total;
        const totalPages = Math.ceil(totalDemandas / limit);
        //consulta par obtener los registros de la pagina 
        const demandasQuery = `select * from demanda ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(demandasQuery, queryParams, (err, demandasResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Errror al obtener las demandas' });
            }
            //Enviar respuesta on los datos y la informacion de paginación
            res.json({
                totalItems: totalDemandas,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: demandasResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken, (req, res) => {
    //obtener los datos
    const { carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos } = req.body;
    
    // Verificar si ya existe una demanda con la misma carrera, periodo y asignatura
    const search_query = 'select count(*) as contador from demanda where carreras_idcarreras = ? and periodos_idperiodos = ? and asignaturas_idasignaturas = ?';
    db.query(search_query, [carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la demanda' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'La demanda ya existe para esta carrera, periodo y asignatura' })
        }
        const query = 'INSERT INTO demanda VALUES(null,?,?,?,?,?,?,?)';
        const values = [carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar demanda' });
            }
            res.status(201).json({
                message: 'Demanda insertada correctamente', iddemanda: result.insertId
            })
        })
    })


})

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos } = req.body;
    const query = 'update demanda set carreras_idcarreras = ?, periodos_idperiodos = ?, asignaturas_idasignaturas = ?, dem_nivel = ?, dem_num_hor_clase = ?, dem_num_estudiantes = ?, dem_num_paralelos = ? WHERE iddemanda = ?';
    const values = [carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar demanda' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Demanda no encontrada" })
        }
        res.status(200).json({ message: 'Demanda actualizada correctamente' })
    })
})

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // Aquí verifiqué si la demanda está siendo usada en la tabla 'asignacion_actividad' (por si existe una relación)
    // Si no tienes una tabla relacionada, puedes quitar esta validación y borrar directamente.
    const search_query = 'select count(*) as contador from asignacion_actividad where demanda_iddemanda = ? '
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar la asignacion de actividad' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Demanda no se puede eliminar por que tiene una asignacion de actividad registrada' })
        }
        const query = 'DELETE FROM demanda WHERE iddemanda = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar demanda' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Demanda no encontrada' });
            }
            res.status(200).json({ mensaje: 'Demanda eliminada correctamente' });
        });
    })


});
module.exports = router;