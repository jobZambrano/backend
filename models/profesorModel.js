const db = require('../db');

const ProfesorModel = {
    // Obtener un docente por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM PROFESORES WHERE idprofesores = ?', [id]);
        return results[0];
    },

    // Obtener todos los docentes con paginación y búsqueda
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE pro_apellidosNombres LIKE ? OR pro_cedula LIKE ? OR pro_email LIKE ?';
            const searchTerm = `%${cadena}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        const countQuery = `SELECT COUNT(*) as total FROM profesores ${whereClause}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalDocentes = countResult[0].total;
        const totalPages = Math.ceil(totalDocentes / limit);

        const profesoresQuery = `SELECT * FROM profesores ${whereClause} ORDER BY idprofesores DESC LIMIT ? OFFSET ?`;
        const queryParamsPaginados = [...queryParams, limit, offset];

        const [profesoresResult] = await db.query(profesoresQuery, queryParamsPaginados);

        return {
            totalItems: totalDocentes,
            totalPages: totalPages,
            data: profesoresResult
        };
    },

    // Verificar si existe por cédula
    existsByCedula: async (pro_cedula) => {
        const search_query = 'SELECT COUNT(*) as contador FROM profesores WHERE pro_cedula = ?';
        const [result] = await db.query(search_query, [pro_cedula]);
        return result[0].contador > 0;
    },

    // Crear un nuevo docente
    create: async (data) => {
        const query = 'INSERT INTO profesores (pro_apellidosNombres, pro_cedula, pro_email, pro_password, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
            data.pro_apellidosNombres,
            data.pro_cedula,
            data.pro_email,
            data.pro_password,
            data.pro_tipo,
            data.pro_sexo,
            data.pro_categoria,
            data.pro_titulo_tercer,
            data.pro_titulo_cuarto,
            data.pro_tipo_cuarto
        ];
        const [insertResult] = await db.query(query, values);
        return insertResult.insertId;
    },

    // Actualizar un docente
    update: async (id, data) => {
        const query = 'UPDATE profesores SET pro_apellidosNombres=?, pro_cedula=?, pro_email=?, pro_password=?, pro_tipo=?, pro_sexo=?, pro_categoria=?, pro_titulo_tercer=?, pro_titulo_cuarto=?, pro_tipo_cuarto=? WHERE idprofesores=?';
        const values = [
            data.pro_apellidosNombres,
            data.pro_cedula,
            data.pro_email,
            data.pro_password,
            data.pro_tipo,
            data.pro_sexo,
            data.pro_categoria,
            data.pro_titulo_tercer,
            data.pro_titulo_cuarto,
            data.pro_tipo_cuarto,
            id
        ];
        const [result] = await db.query(query, values);
        return result.affectedRows > 0;
    },

    // Verificar si existe por ID (para el delete)
    existsById: async (id) => {
        const search_query = 'SELECT COUNT(*) as Docentes FROM profesores WHERE idprofesores = ?';
        const [result] = await db.query(search_query, [id]);
        return result[0].Docentes > 0;
    },

    // Eliminar un docente
    delete: async (id) => {
        const query = 'DELETE FROM profesores WHERE idprofesores = ?';
        await db.query(query, [id]);
    }
};

module.exports = ProfesorModel;