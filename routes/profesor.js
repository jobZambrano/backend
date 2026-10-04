const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');
const bcrypt = require('bcrypt');

// metodo get para registro unico
router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM PROFESORES WHERE idprofesores = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'error al obtener el Docente' });
    }
});

//metodo get (MÚLTIPLES REGISTROS)
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const cadena = req.query.cadena;
        
        let whereClause = '';
        let queryParams = [];
        
        if (cadena) {
            whereClause = 'WHERE pro_apellidosNombres LIKE ? OR pro_cedula LIKE ? OR pro_email LIKE ?';
            const searchTerm = `%${cadena}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Consulta para obtener total de registros
        const countQuery = `SELECT COUNT(*) as total FROM profesores ${whereClause}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalDocentes = countResult[0].total;
        const totalPages = Math.ceil(totalDocentes / limit);

        // Consulta para obtener los registros de la página (Usamos spread para no mutar queryParams)
        const profesoresQuery = `SELECT * FROM profesores ${whereClause} ORDER BY idprofesores DESC LIMIT ? OFFSET ?`;
        const queryParamsPaginados = [...queryParams, limit, offset];
        
        const [profesoresResult] = await db.query(profesoresQuery, queryParamsPaginados);

        res.json({
            totalItems: totalDocentes,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            data: profesoresResult
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener docentes' });
    }
});

//metodo post registro de docente
router.post('/', verifyToken, async (req, res) => {
    // Quitamos idprofesores de aquí porque es autoincremental en la BD
    const { pro_apellidosNombres, pro_cedula, pro_email, pro_password, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto } = req.body;

    try {
        const search_query = 'SELECT COUNT(*) as contador FROM profesores WHERE pro_cedula = ?';
        const [result] = await db.query(search_query, [pro_cedula]);

        if (result[0].contador > 0) {
            return res.status(409).json({ error: "El docente con cédula: " + pro_cedula + " ya existe" });
        }

        const claveHasheada = await bcrypt.hash(pro_password, 12);
        
        // Insertamos listando las columnas explícitamente para evitar errores
        const query = 'INSERT INTO profesores (pro_apellidosNombres, pro_cedula, pro_email, pro_password, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        
        const values = [
            pro_apellidosNombres, 
            pro_cedula, 
            pro_email, 
            claveHasheada, 
            pro_tipo, 
            pro_sexo, 
            pro_categoria, 
            pro_titulo_tercer, 
            pro_titulo_cuarto, 
            pro_tipo_cuarto
        ];

        const [insertResult] = await db.query(query, values);

        res.status(201).json({
            message: 'Docente insertado correctamente',
            id_profesor: insertResult.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al procesar la solicitud' });
    }
});

//METODO PUT
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { pro_apellidosNombres, pro_cedula, pro_email, pro_password, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(pro_password, 12);
        
        const query = 'UPDATE profesores SET pro_apellidosNombres=?, pro_cedula=?, pro_email=?, pro_password=?, pro_tipo=?, pro_sexo=?, pro_categoria=?, pro_titulo_tercer=?, pro_titulo_cuarto=?, pro_tipo_cuarto=? WHERE idprofesores=?';
        const values = [pro_apellidosNombres, pro_cedula, pro_email, hashedPassword, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto, id];

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Docente no encontrado' });
        }
        
        res.status(200).json({ message: 'Docente actualizado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al procesar la solicitud' });
    }
});

//metodo delete
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        // NOTA: Tu lógica original decía que no se puede eliminar si está asociado, 
        // pero la consulta solo verifica si el docente existe en la tabla profesores.
        // Si existe, el contador es > 0, por lo que NUNCA se podría eliminar.
        // Aquí verificamos si existe, y si existe, procedemos a eliminarlo.
        // Si deseas protegerlo, deberías consultar en la tabla de 'asignacion' o similar.
        
        const search_query = 'SELECT COUNT(*) as Docentes FROM profesores WHERE idprofesores = ?';
        const [result] = await db.query(search_query, [id]);

        if (result[0].Docentes === 0) {
             return res.status(404).json({ message: 'Docente no encontrado' });
        }
        
        const query = 'DELETE FROM profesores WHERE idprofesores = ?';
        await db.query(query, [id]);

        res.status(200).json({
            message: 'Docente eliminado correctamente',
            idprofesor: id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar docente' });
    }
});

module.exports = router;