const db = require('../db');

const AsignaturaModel = {
    // Obtener una asignatura por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM asignaturas WHERE idasignaturas = ?', [id]);
        return results[0];
    },

    // Obtener todas las asignaturas con paginación y búsqueda (con JOIN a carreras)
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE a.asi_nombres LIKE ? OR c.car_nombre LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM asignaturas a
            JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalAsignaturas = countResult[0].total;
        const totalPages = Math.ceil(totalAsignaturas / limit);

        const asignaturasQuery = `
            SELECT a.*, c.car_nombre 
            FROM asignaturas a
            JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        const queryParamsPaginados = [...queryParams, limit, offset];
        const [asignaturasResult] = await db.query(asignaturasQuery, queryParamsPaginados);

        return {
            totalItems: totalAsignaturas,
            totalPages: totalPages,
            data: asignaturasResult
        };
    },

    // Verificar si existe por nombre y carrera
    existsByNombreCarrera: async (asi_nombres, carreras_idcarreras) => {
        const [result] = await db.query(
            'SELECT COUNT(*) as contador FROM asignaturas WHERE asi_nombres = ? AND carreras_idcarreras = ?',
            [asi_nombres, carreras_idcarreras]
        );
        return result[0].contador > 0;
    },

    // Crear una nueva asignatura
    create: async (asi_nombres, carreras_idcarreras, asi_activa) => {
        const [insertResult] = await db.query(
            'INSERT INTO asignaturas (asi_nombres, carreras_idcarreras, asi_activa) VALUES (?, ?, ?)',
            [asi_nombres, carreras_idcarreras, asi_activa ?? 1]
        );
        return insertResult.insertId;
    },

    // Actualizar una asignatura
    update: async (id, asi_nombres, carreras_idcarreras, asi_activa) => {
        const [result] = await db.query(
            'UPDATE asignaturas SET asi_nombres = ?, carreras_idcarreras = ?, asi_activa = ? WHERE idasignaturas = ?',
            [asi_nombres, carreras_idcarreras, asi_activa, id]
        );
        return result.affectedRows > 0;
    },

    // Verificar si tiene demandas asociadas (para el delete)
    hasDemandas: async (id) => {
        const [result] = await db.query(
            'SELECT COUNT(*) as contador FROM demanda WHERE asignaturas_idasignaturas = ?',
            [id]
        );
        return result[0].contador > 0;
    },

    // Eliminar una asignatura
    delete: async (id) => {
        const [deleteResult] = await db.query('DELETE FROM asignaturas WHERE idasignaturas = ?', [id]);
        return deleteResult.affectedRows > 0;
    }
};

module.exports = AsignaturaModel;