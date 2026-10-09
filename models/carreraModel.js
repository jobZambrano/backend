const db = require('../db');

const CarreraModel = {
    // Obtener una carrera por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM carreras WHERE idcarreras = ?', [id]);
        return results[0];
    },

    // Obtener todas las carreras con paginación y búsqueda
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE car_nombre LIKE ? OR car_alias LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM carreras ${whereClause}`, queryParams);
        const totalCarreras = countResult[0].total;
        const totalPages = Math.ceil(totalCarreras / limit);

        const queryParamsPaginados = [...queryParams, limit, offset];
        const [carrerasResult] = await db.query(`
    SELECT c.*, COUNT(a.idasignaturas) AS total_asignaturas
    FROM carreras c
    LEFT JOIN asignaturas a ON a.carreras_idcarreras = c.idcarreras
    ${whereClause ? whereClause.replace('car_nombre', 'c.car_nombre').replace('car_alias', 'c.car_alias') : ''}
    GROUP BY c.idcarreras
    LIMIT ? OFFSET ?
`, queryParamsPaginados);
        return {
            totalItems: totalCarreras,
            totalPages: totalPages,
            data: carrerasResult
        };
    },

    // Verificar si existe por nombre
    existsByName: async (car_nombre) => {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM carreras WHERE car_nombre = ?', [car_nombre]);
        return result[0].contador > 0;
    },

    // Crear una nueva carrera
    create: async (car_nombre, car_alias) => {
        const [insertResult] = await db.query('INSERT INTO carreras (car_nombre, car_alias) VALUES (?, ?)', [car_nombre, car_alias]);
        return insertResult.insertId;
    },

    // Actualizar una carrera
    update: async (id, car_nombre, car_alias) => {
        const [result] = await db.query('UPDATE carreras SET car_nombre = ?, car_alias = ? WHERE idcarreras = ?', [car_nombre, car_alias, id]);
        return result.affectedRows > 0;
    },

    // Verificar si tiene asignaturas asociadas (para el delete)
    hasAsignaturas: async (id) => {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignaturas WHERE carreras_idcarreras = ?', [id]);
        return result[0].contador > 0;
    },

    // Eliminar una carrera
    delete: async (id) => {
        const [deleteResult] = await db.query('DELETE FROM carreras WHERE idcarreras = ?', [id]);
        return deleteResult.affectedRows > 0;
    }
};

module.exports = CarreraModel;