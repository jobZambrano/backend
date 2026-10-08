const ActividadModel = require('../models/actividadModel');

const ActividadController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const actividad = await ActividadModel.getById(id);
            if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });
            res.json(actividad);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener la actividad' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await ActividadModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las actividades' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { act_nombre } = req.body;
        try {
            const existe = await ActividadModel.existsByName(act_nombre);
            if (existe) {
                return res.status(409).json({ error: 'La actividad con nombre ' + act_nombre + ' ya existe' });
            }

            const idactividad = await ActividadModel.create(act_nombre);

            res.status(201).json({
                message: 'Actividad insertada correctamente',
                idactividad: idactividad
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar actividad' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { act_nombre } = req.body;
        try {
            const actualizado = await ActividadModel.update(id, act_nombre);
            if (!actualizado) return res.status(404).json({ message: "Actividad no encontrada" });
            res.status(200).json({ message: 'Actividad actualizada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar actividad' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const tieneAsignaciones = await ActividadModel.hasAssignments(id);
            if (tieneAsignaciones) {
                return res.status(409).json({ error: 'Actividad no se puede eliminar porque tiene asignaciones registradas' });
            }

            const eliminado = await ActividadModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Actividad no encontrada' });

            res.status(200).json({ mensaje: 'Actividad eliminada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar actividad' });
        }
    }
};

module.exports = ActividadController;