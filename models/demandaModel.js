const db = require('../db');

const DemandaModel = {
    // Obtener una demanda por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM demanda WHERE iddemanda = ?', [id]);
        return results[0];
    },

    // Obtener todas las demandas con paginación y búsqueda
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE d.dem_nivel LIKE ? OR c.car_nombre LIKE ? OR p.per_nombre LIKE ? OR a.asi_nombres LIKE ?';
            queryParams.push(`%${cadena}%`);
            queryParams.push(term, term, term, term);
        }

        const [countResult] = await db.query(countQuery, queryParams);
        const totalDemandas = countResult[0].total;
        const totalPages = Math.ceil(totalDemandas / limit);

        const query = `
        SELECT d.*, c.car_nombre, p.per_nombre, a.asi_nombres
        FROM demanda d
        JOIN carreras c ON d.carreras_idcarreras = c.idcarreras
        JOIN periodos p ON d.periodos_idperiodos = p.idperiodos
        JOIN asignaturas a ON d.asignaturas_idasignaturas = a.idasignaturas
        ${whereClause}
        LIMIT ? OFFSET ?`;
        const queryParamsPaginados = [...queryParams, limit, offset];
        const [results] = await db.query(query, queryParamsPaginados);

        return {
            totalItems: totalDemandas,
            totalPages: totalPages,
            data: results
        };
    },

    // Verificar si ya existe una demanda para esa carrera, periodo y asignatura
    existsByRelacion: async (carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas) => {
        const [result] = await db.query(
            'SELECT COUNT(*) as contador FROM demanda WHERE carreras_idcarreras = ? AND periodos_idperiodos = ? AND asignaturas_idasignaturas = ?',
            [carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas]
        );
        return result[0].contador > 0;
    },

    // Crear una nueva demanda
    create: async (data) => {
        const query = 'INSERT INTO demanda VALUES(null,?,?,?,?,?,?,?)';
        const values = [
            data.carreras_idcarreras,
            data.periodos_idperiodos,
            data.asignaturas_idasignaturas,
            data.dem_nivel,
            data.dem_num_hor_clase,
            data.dem_num_estudiantes,
            data.dem_num_paralelos
        ];
        const [insertResult] = await db.query(query, values);
        return insertResult.insertId;
    },

    // Actualizar una demanda
    update: async (id, data) => {
        const query = 'UPDATE demanda SET carreras_idcarreras = ?, periodos_idperiodos = ?, asignaturas_idasignaturas = ?, dem_nivel = ?, dem_num_hor_clase = ?, dem_num_estudiantes = ?, dem_num_paralelos = ? WHERE iddemanda = ?';
        const values = [
            data.carreras_idcarreras,
            data.periodos_idperiodos,
            data.asignaturas_idasignaturas,
            data.dem_nivel,
            data.dem_num_hor_clase,
            data.dem_num_estudiantes,
            data.dem_num_paralelos,
            id
        ];
        const [result] = await db.query(query, values);
        return result.affectedRows > 0;
    },

    // Verificar si tiene asignaciones de actividad (para el delete)
    hasAsignaciones: async (id) => {
        const [result] = await db.query('SELECT COUNT(*) as contador FROM asignacion_actividad WHERE demanda_iddemanda = ?', [id]);
        return result[0].contador > 0;
    },

    // Eliminar una demanda
    delete: async (id) => {
        const [deleteResult] = await db.query('DELETE FROM demanda WHERE iddemanda = ?', [id]);
        return deleteResult.affectedRows > 0;
    }
};

module.exports = DemandaModel;