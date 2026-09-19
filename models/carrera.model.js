// CAMBIAR ESTO:
// const db = require('../config/config');

// POR ESTO:
const db = require('../db');

const CarreraModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM carreras');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM carreras WHERE idcarreras = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { car_nombre, car_alias } = data;
    const [result] = await db.query(
      'INSERT INTO carreras (car_nombre, car_alias) VALUES (?, ?)',
      [car_nombre, car_alias]
    );
    return { idcarreras: result.insertId, car_nombre, car_alias };
  }
};

module.exports = CarreraModel;