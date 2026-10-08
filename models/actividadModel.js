const db = require('../db');

const ActividadModel = {
    // Obtener una actividad por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM actividad WHERE idactividad = ?', [id]);
        return results[0];
    },

    // Obtener todas las actividades con paginación y búsqueda
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE act_nombre LIKE ?';
            queryParams.push(`%${cadena}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM actividad ${whereClause}`, queryParams);
        const totalActividades = countResult[0].total;
        const totalPages = Math.ceil(totalActividades / limit);

        const queryParamsPaginados = [...queryParams, limit, offset];
        const [actividadesResult] = await db.query(`SELECT * FROM actividad ${whereClause} LIMIT ? OFFSET ?`, queryParamsPaginados);

        return {
            totalItems: totalActividades,
            totalPages: totalPages,
            data: actividadesResult
        };
    },

    // Verificar si existe por nombre
    existsByName: async (act_nombre) => {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM actividad WHERE act_nombre = ?', [act_nombre]);
        return result[0].contador > 0;
    },

    // Crear una nueva actividad
    create: async (act_nombre) => {
        const [insertResult] = await db.query('INSERT INTO actividad (act_nombre) VALUES (?)', [act_nombre]);
        return insertResult.insertId;
    },

    // Actualizar una actividad
    update: async (id, act_nombre) => {
        const [result] = await db.query('UPDATE actividad SET act_nombre = ? WHERE idactividad = ?', [act_nombre, id]);
        return result.affectedRows > 0;
    },

    // Verificar si tiene asignaciones (para el delete)
    hasAssignments: async (id) => {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignacion_actividad WHERE actividad_idactividad = ?', [id]);
        return result[0].contador > 0;
    },

    // Eliminar una actividad
    delete: async (id) => {
        const [deleteResult] = await db.query('DELETE FROM actividad WHERE idactividad = ?', [id]);
        return deleteResult.affectedRows > 0;
    }
};

module.exports = ActividadModel;