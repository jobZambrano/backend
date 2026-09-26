const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');

//metodo get para registros unicos
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const query = 'SELECT * FROM coordinadores WHERE idcoordinadores = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener el coordinador' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Coordinador no encontrado' });
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
        //Buscar por nombre de profesor o nombre de carrera
        whereClause = 'WHERE p.pro_apellidosNombres LIKE ? OR c.car_nombre LIKE ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm);
    }

    //consultas para obtener total registros
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM coordinadores co
        JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
        JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
        ${whereClause}
    `;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de coordinadores' });
        }
        const totalCoordinadores = countResult[0].total;
        const totalPages = Math.ceil(totalCoordinadores / limit);
        //consulta para obtener los registros de la pagina
        const coordinadoresQuery = `
            SELECT co.*, p.pro_apellidosNombres, c.car_nombre 
            FROM coordinadores co
            JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
            JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);
        db.query(coordinadoresQuery, queryParams, (err, coordinadoresResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener los coordinadores' });
            }
            //Enviar respuesta con los datos y la informacion de paginación
            res.json({
                totalItems: totalCoordinadores,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
                data: coordinadoresResult
            });
        });
    });
});

//Metodo POST
router.post('/', verifyToken, (req, res) => {
    //obtener los datos
    const { profesores_idprofesores, carreras_idcarreras, coo_rol } = req.body;
    
    // Verificar si ya existe un coordinador con el mismo profesor, carrera y rol
    const search_query = 'SELECT COUNT(*) as contador FROM coordinadores WHERE profesores_idprofesores = ? AND carreras_idcarreras = ? AND coo_rol = ?';
    db.query(search_query, [profesores_idprofesores, carreras_idcarreras, coo_rol], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar el coordinador' });
        }
        if (result[0].contador > 0) {
            return res.status(500).json({ error: 'El coordinador ya existe para este profesor, carrera y rol' });
        }
        const query = 'INSERT INTO coordinadores (profesores_idprofesores, carreras_idcarreras, coo_rol) VALUES (?, ?, ?)';
        const values = [profesores_idprofesores, carreras_idcarreras, coo_rol];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(409).json({ error: 'Error al insertar coordinador' });
            }
            res.status(201).json({
                message: 'Coordinador insertado correctamente',
                idcoordinadores: result.insertId
            });
        });
    });
});

//Metodo Put
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //capturar id desde los parametros de la URL
    const { profesores_idprofesores, carreras_idcarreras, coo_rol } = req.body;
    const query = 'UPDATE coordinadores SET profesores_idprofesores = ?, carreras_idcarreras = ?, coo_rol = ? WHERE idcoordinadores = ?';
    const values = [profesores_idprofesores, carreras_idcarreras, coo_rol, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar coordinador' });
        }
        if (result.affectedRows == 0) {
            return res.status(404).json({ message: "Coordinador no encontrado" });
        }
        res.status(200).json({ message: 'Coordinador actualizado correctamente' });
    });
});

//Metodo DELETE
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    // No hay una tabla que referencie directamente a coordinadores, por lo que se elimina directamente.
    // Si en el futuro existiera una tabla relacionada, se podría añadir la verificación.
    const query = 'DELETE FROM coordinadores WHERE idcoordinadores = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al eliminar coordinador' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Coordinador no encontrado' });
        }
        res.status(200).json({ mensaje: 'Coordinador eliminado correctamente' });
    });
});

module.exports = router;