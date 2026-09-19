// CAMBIAR ESTO:
// const db = require('../config/config');

// POR ESTO:
const db = require('../db');

const AsignaturaModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT a.*, c.car_nombre 
      FROM asignaturas a
      JOIN carreras c ON a.carreras_idcarreras = c.idcarreras
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM asignaturas WHERE idasignaturas = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { asi_nombres, carreras_idcarreras, asi_activa } = data;
    const [result] = await db.query(
      'INSERT INTO asignaturas (asi_nombres, carreras_idcarreras, asi_activa) VALUES (?, ?, ?)',
      [asi_nombres, carreras_idcarreras, asi_activa ?? 1]
    );
    return { idasignaturas: result.insertId, ...data };
  }
};

module.exports = AsignaturaModel;