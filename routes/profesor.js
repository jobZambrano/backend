const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');
const bcrypt = require('bcrypt');

// metodo get para registro unico
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM PROFESOR WHERE id_profesores =?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'error al obtener el Docente' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }
        res.json(results[0]);
    });
});

//metodo get
router.get('/', verifyToken, (req, res) => {
    // obtener parámetros de la URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit; // el punto de inicio de la consulta
    const cadena = req.query.cadena;
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        whereClause = 'WHERE pro_apellidosNombres LIKE ? OR pro_cedula LIKE ? OR pro_email LIKE ?';;
        const searchTerm = `%${cadena}%`
        queryParams.push(searchTerm, searchTerm, searchTerm)
    }

    // consulta para obtener total de registros
    const countQuery = `SELECT COUNT(*) as total FROM profesores ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de docentes.' });
        }

        const totalDocentes = countResult[0].total;
        const totalPages = Math.ceil(totalDocentes / limit);

        // consulta para obtener los registros de la página

        const profesoresQuery = `SELECT * FROM profesores ${whereClause} ORDER BY idprofesores DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(profesoresQuery, queryParams, (err, profesoresResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener docentes' });
            }

            // enviar respuesta con los datos y paginación
            res.json({
                totalItems: totalDocentes,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: profesoresResult
            });
        });
    });
});
//metodo post registro de docente
    
    router.post('/', verifyToken, async (req, res) => {

    //obtener los datos
    const {idprofesores, pro_apellidosNombres, pro_cedula, pro_email, pro_password, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto } = req.body;
    
    const search_query = 'SELECT pro_cedula FROM profesores WHERE pro_cedula = ?';
    db.query(search_query, [pro_cedula], async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error interno al verificar el docente" })
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: "El docente :" + pro_cedula + " ya exite" })
        }
        const query = 'insert into profesores values(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        try {
            const claveHasheada = await bcrypt.hash(pro_password, 12);
            const values = [pro_apellidosNombres, pro_cedula, pro_email, claveHasheada, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto];
            db.query(query, values, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Error al insetar docente' });
                }
                res.status(201).json({
                    message: 'Docente insertado correctamente',
                    id_profesor: result.insertId
                })
            });
        } catch (error) {
            return res.status(500).json({ error: 'Error al insetar docente' });
        }
    })


})
//METODO PUT
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { pro_apellidosNombres, pro_cedula, pro_email, pro_password, 
        pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto } = req.body;
    const query = 'update tecnicos set pro_cedula = ? , nombre_tec = ?, especialidad_tec = ? , telefono_tec = ? where id_tec = ?;';
    const values = [pro_cedula, nombre_tec, especialidad_tec, telefono_tec, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar cliente' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tecnico no encontrado' })

        }
        res.status(201).json({
            message: 'Tecnico actualizado correctamente',
            id_tec: id
        })
    })


})
//metodo delete
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const search_query = 'select count(*) as contador from ordenes where id_tec =?;';
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar tecnicos' });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ message: 'La orden no se puede eliminar esta asociada con tecnicos' })

        }
        const query = 'DELETE FROM tecnicos WHERE  id_tec = ?;';
        const values = [id];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar cliente' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Tecnico no encontrado' })

            }
            res.status(200).json({
                message: 'Tecnico eliminado correctamente',
                id_tec: id
            })
        })
    });
});

module.exports = router;  