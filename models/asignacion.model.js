// CAMBIAR ESTO:
// const db = require('../config/config');

// POR ESTO:
const db = require('../db');

const AsignacionModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT a.*, p.pro_apellidosNombres, d.dem_nivel 
      FROM asignacion a
      JOIN profesores p ON a.profesores_idprofesores = p.idprofesores
      JOIN demanda d ON a.demanda_iddemanda = d.iddemanda
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM asignacion WHERE idasignacion = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = data;
    const [result] = await db.query(
      'INSERT INTO asignacion (profesores_idprofesores, demanda_iddemanda, asi_num_horas) VALUES (?, ?, ?)',
      [profesores_idprofesores, demanda_iddemanda, asi_num_horas]
    );
    return { idasignacion: result.insertId, ...data };
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM asignacion WHERE idasignacion = ?', [id]);
    return result;
  }
};

module.exports = AsignacionModel;