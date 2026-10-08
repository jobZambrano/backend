const db = require('../db');

const PeriodoModel = {
    // Obtener un periodo por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM periodos WHERE idperiodos = ?', [id]);
        return results[0];
    },

    // Obtener todos los periodos con paginación y búsqueda
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE per_nombre LIKE ?';
            queryParams.push(`%${cadena}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM periodos ${whereClause}`, queryParams);
        const totalPeriodos = countResult[0].total;
        const totalPages = Math.ceil(totalPeriodos / limit);

        const queryParamsPaginados = [...queryParams, limit, offset];
        const [periodosResult] = await db.query(`SELECT * FROM periodos ${whereClause} LIMIT ? OFFSET ?`, queryParamsPaginados);

        return {
            totalItems: totalPeriodos,
            totalPages: totalPages,
            data: periodosResult
        };
    },

    // Verificar si existe por nombre
    existsByName: async (per_nombre) => {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM periodos WHERE per_nombre = ?', [per_nombre]);
        return result[0].contador > 0;
    },

    // Crear un nuevo periodo
    create: async (per_nombre, per_activa, per_mostrar) => {
        const [insertResult] = await db.query('INSERT INTO periodos VALUES(null,?,?,?)', [per_nombre, per_activa, per_mostrar]);
        return insertResult.insertId;
    },

    // Actualizar un periodo
    update: async (id, per_nombre, per_activa, per_mostrar) => {
        const [result] = await db.query('UPDATE periodos SET per_nombre = ?, per_activa = ?, per_mostrar = ? WHERE idperiodos = ?', [per_nombre, per_activa, per_mostrar, id]);
        return result.affectedRows > 0;
    },

    // Verificar si tiene demandas asociadas (para el delete)
    hasDemandas: async (id) => {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM demanda WHERE periodos_idperiodos = ?', [id]);
        return result[0].contador > 0;
    },

    // Eliminar un periodo
    delete: async (id) => {
        const [deleteResult] = await db.query('DELETE FROM periodos WHERE idperiodos = ?', [id]);
        return deleteResult.affectedRows > 0;
    }
};

module.exports = PeriodoModel;