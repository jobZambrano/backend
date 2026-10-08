const AsignacionActividadModel = require('../models/asignacionActividadModel');

const AsignacionActividadController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const asignacion = await AsignacionActividadModel.getById(id);
            if (!asignacion) return res.status(404).json({ error: 'Asignacion de actividad no encontrada' });
            res.json(asignacion);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener la asignacion de actividad' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await AsignacionActividadModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las asignaciones de actividad' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = req.body;
        try {
            const existe = await AsignacionActividadModel.existsByRelacion(periodos_idperiodos, actividad_idactividad, profesores_idprofesores);
            if (existe) {
                return res.status(409).json({ error: 'La asignacion de actividad ya existe para este periodo, actividad y profesor' });
            }

            const idasignacion_actividad = await AsignacionActividadModel.create(
                periodos_idperiodos,
                actividad_idactividad,
                profesores_idprofesores,
                act_num_horas
            );

            res.status(201).json({
                message: 'Asignacion de actividad insertada correctamente',
                idasignacion_actividad: idasignacion_actividad
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar asignacion de actividad' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { periodos_idperiodos, actividad_idactividad, profesores_idprofesores, act_num_horas } = req.body;
        try {
            const actualizado = await AsignacionActividadModel.update(
                id,
                periodos_idperiodos,
                actividad_idactividad,
                profesores_idprofesores,
                act_num_horas
            );
            if (!actualizado) return res.status(404).json({ message: "Asignacion de actividad no encontrada" });
            res.status(200).json({ message: 'Asignacion de actividad actualizada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar asignacion de actividad' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const eliminado = await AsignacionActividadModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Asignacion de actividad no encontrada' });
            res.status(200).json({ mensaje: 'Asignacion de actividad eliminada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar asignacion de actividad' });
        }
    }
};

module.exports = AsignacionActividadController;