const db = require('../db');

const AsignacionModel = {
    // Obtener una asignación por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM asignacion WHERE idasignacion = ?', [id]);
        return results[0];
    },

    // Obtener todas las asignaciones con paginación y búsqueda (con JOINs)
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE p.pro_apellidosNombres LIKE ? OR d.dem_nivel LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM asignacion a
            JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
            JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalAsignaciones = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaciones / limit);

        const asignacionesQuery = `
            SELECT a.*, p.pro_apellidosNombres, d.dem_nivel 
            FROM asignacion a
            JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
            JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        const queryParamsPaginados = [...queryParams, limit, offset];
        const [asignacionesResult] = await db.query(asignacionesQuery, queryParamsPaginados);

        return {
            totalItems: totalAsignaciones,
            totalPages: totalPages,
            data: asignacionesResult
        };
    },

    // Verificar si ya existe una asignación con esa combinación
    existsByRelacion: async (profesores_idprofesores, demanda_iddemanda) => {
        const [result] = await db.query(
            'SELECT COUNT(*) as contador FROM asignacion WHERE profesores_idprofesores = ? AND demanda_iddemanda = ?',
            [profesores_idprofesores, demanda_iddemanda]
        );
        return result[0].contador > 0;
    },

    // Crear una nueva asignación
    create: async (profesores_idprofesores, demanda_iddemanda, asi_num_horas) => {
        const [insertResult] = await db.query(
            'INSERT INTO asignacion (profesores_idprofesores, demanda_iddemanda, asi_num_horas) VALUES (?, ?, ?)',
            [profesores_idprofesores, demanda_iddemanda, asi_num_horas]
        );
        return insertResult.insertId;
    },

    // Actualizar una asignación
    update: async (id, profesores_idprofesores, demanda_iddemanda, asi_num_horas) => {
        const [result] = await db.query(
            'UPDATE asignacion SET profesores_idprofesores = ?, demanda_iddemanda = ?, asi_num_horas = ? WHERE idasignacion = ?',
            [profesores_idprofesores, demanda_iddemanda, asi_num_horas, id]
        );
        return result.affectedRows > 0;
    },

    // Eliminar una asignación
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM asignacion WHERE idasignacion = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = AsignacionModel;