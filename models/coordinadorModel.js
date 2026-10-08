const db = require('../db');

const CoordinadorModel = {
    // Obtener un coordinador por ID
    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM coordinadores WHERE idcoordinadores = ?', [id]);
        return results[0];
    },

    // Obtener todos los coordinadores con paginación y búsqueda (con JOINs)
    getAll: async (limit, offset, cadena) => {
        let whereClause = '';
        let queryParams = [];

        if (cadena) {
            whereClause = 'WHERE p.pro_apellidosNombres LIKE ? OR c.car_nombre LIKE ?';
            queryParams.push(`%${cadena}%`, `%${cadena}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM coordinadores co
            JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
            JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
            ${whereClause}
        `;
        const [countResult] = await db.query(countQuery, queryParams);
        const totalCoordinadores = countResult[0].total;
        const totalPages = Math.ceil(totalCoordinadores / limit);

        const coordinadoresQuery = `
            SELECT co.*, p.pro_apellidosNombres, c.car_nombre 
            FROM coordinadores co
            JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
            JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
            ${whereClause}
            LIMIT ? OFFSET ?
        `;
        const queryParamsPaginados = [...queryParams, limit, offset];
        const [coordinadoresResult] = await db.query(coordinadoresQuery, queryParamsPaginados);

        return {
            totalItems: totalCoordinadores,
            totalPages: totalPages,
            data: coordinadoresResult
        };
    },

    // Verificar si ya existe un coordinador con esa combinación
    existsByRelacion: async (profesores_idprofesores, carreras_idcarreras, coo_rol) => {
        const [result] = await db.query(
            'SELECT COUNT(*) as contador FROM coordinadores WHERE profesores_idprofesores = ? AND carreras_idcarreras = ? AND coo_rol = ?',
            [profesores_idprofesores, carreras_idcarreras, coo_rol]
        );
        return result[0].contador > 0;
    },

    // Crear un nuevo coordinador
    create: async (profesores_idprofesores, carreras_idcarreras, coo_rol) => {
        const [insertResult] = await db.query(
            'INSERT INTO coordinadores (profesores_idprofesores, carreras_idcarreras, coo_rol) VALUES (?, ?, ?)',
            [profesores_idprofesores, carreras_idcarreras, coo_rol]
        );
        return insertResult.insertId;
    },

    // Actualizar un coordinador
    update: async (id, profesores_idprofesores, carreras_idcarreras, coo_rol) => {
        const [result] = await db.query(
            'UPDATE coordinadores SET profesores_idprofesores = ?, carreras_idcarreras = ?, coo_rol = ? WHERE idcoordinadores = ?',
            [profesores_idprofesores, carreras_idcarreras, coo_rol, id]
        );
        return result.affectedRows > 0;
    },

    // Eliminar un coordinador
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM coordinadores WHERE idcoordinadores = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = CoordinadorModel;