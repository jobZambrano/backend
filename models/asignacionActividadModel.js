const db = require('../db');

const AsignacionActividadModel = {
    // Obtener una asignación de actividad por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM asignacion_actividad WHERE idasignacion_actividad = ?', [id]);
        return results[0];
    },

    // Obtener todas las asignaciones con paginación y búsqueda (con JOINs)
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE p.per_nombre LIKE ? OR act.act_nombre LIKE ? OR prof.pro_apellidosNombres LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM asignacion_actividad aa
            JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
            JOIN actividad act ON aa.actividad_idactividad = act.idactividad
            JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalAsignaciones = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaciones / limit);

        const asignacionesQuery = `
            SELECT aa.*, p.per_nombre, act.act_nombre, prof.pro_apellidosNombres
            FROM asignacion_actividad aa
            JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
            JOIN actividad act ON aa.actividad_idactividad = act.idactividad
            JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
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
    existsByRelacion: async (periodos_idperiodos, actividad_idactividad, profesores_idprofesores) => {
        const [result] = await db.query(
            'SELECT COUNT(*) as contador FROM asignacion_actividad WHERE periodos_idperiodos = ? AND actividad_idactividad = ? AND profesores_idprofesores = ?',
            [periodos_idperiodos, actividad_idactividad, profesores_idprofesores]
        );
        return result[0].contador > 0;
    },

    // Crear una nueva asignación de actividad
    create: async (periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas) => {
        const [insertResult] = await db.query(
            'INSERT INTO asignacion_actividad (periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas) VALUES (?, ?, ?, ?)',
            [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas]
        );
        return insertResult.insertId;
    },

    // Actualizar una asignación de actividad
    update: async (id, periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas) => {
        const [result] = await db.query(
            'UPDATE asignacion_actividad SET periodos_idperiodos = ?, actividad_idactividad = ?, profesores_idprofesores = ?, act_num_horas = ? WHERE idasignacion_actividad = ?',
            [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas, id]
        );
        return result.affectedRows > 0;
    },

    // Eliminar una asignación de actividad
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM asignacion_actividad WHERE idasignacion_actividad = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = AsignacionActividadModel;