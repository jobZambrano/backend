// CAMBIAR ESTO:
// const db = require('../config/config');

// POR ESTO:
const db = require('../db');

const CoordinadorModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT co.*, p.pro_apellidosNombres, c.car_nombre 
      FROM coordinadores co
      JOIN profesores p ON co.profesores_idprofesores = p.idprofesores
      JOIN carreras c ON co.carreras_idcarreras = c.idcarreras
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM coordinadores WHERE idcoordinadores = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { profesores_idprofesores, carreras_idcarreras, coo_rol } = data;
    const [result] = await db.query(
      'INSERT INTO coordinadores (profesores_idprofesores, carreras_idcarreras, coo_rol) VALUES (?, ?, ?)',
      [profesores_idprofesores, carreras_idcarreras, coo_rol]
    );
    return { idcoordinadores: result.insertId, ...data };
  }
};

module.exports = CoordinadorModel;