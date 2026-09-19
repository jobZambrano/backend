// CAMBIAR ESTO:
// const db = require('../config/config');

// POR ESTO:
const db = require('../db');

const AsignacionActividadModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT aa.*, p.per_nombre, act.act_nombre, prof.pro_apellidosNombres
      FROM asignacion_actividad aa
      JOIN periodos p ON aa.periodos_idperiodos = p.idperiodos
      JOIN actividad act ON aa.actividad_idactividad = act.idactividad
      JOIN profesores prof ON aa.profesores_idprofesores = prof.idprofesores
    `);
    return rows;
  },

  create: async (data) => {
    const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = data;
    const [result] = await db.query(
      'INSERT INTO asignacion_actividad (periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas) VALUES (?, ?, ?, ?)',
      [periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas]
    );
    return { idasignacion_actividad: result.insertId, ...data };
  }
};

module.exports = AsignacionActividadModel;