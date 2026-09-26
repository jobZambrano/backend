const db = require('../db');
//post
const ActividadModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM actividad');
    return rows;
  },
//get
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM actividad WHERE idactividad = ?', [id]);
    return rows[0];
  },
//get
  create: async (act_nombre) => {
    const [result] = await db.query('INSERT INTO actividad (act_nombre) VALUES (?)', [act_nombre]);
    return { idactividad: result.insertId, act_nombre };
  },
//put
  update: async (id, act_nombre) => {
    await db.query('UPDATE actividad SET act_nombre = ? WHERE idactividad = ?', [act_nombre, id]);
    return { idactividad: id, act_nombre };
  },
//delete
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM actividad WHERE idactividad = ?', [id]);
    return result;
  }
};

module.exports = ActividadModel;