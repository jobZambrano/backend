const AsignacionModel = require('../models/asignacionModel');

const AsignacionController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const asignacion = await AsignacionModel.getById(id);
            if (!asignacion) return res.status(404).json({ error: 'Asignacion no encontrada' });
            res.json(asignacion);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener la asignacion' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await AsignacionModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las asignaciones' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = req.body;
        try {
            const existe = await AsignacionModel.existsByRelacion(profesores_idprofesores, demanda_iddemanda);
            if (existe) {
                return res.status(409).json({ error: 'La asignacion ya existe para este profesor y demanda' });
            }

            const idasignacion = await AsignacionModel.create(profesores_idprofesores, demanda_iddemanda, asi_num_horas);

            res.status(201).json({
                message: 'Asignacion insertada correctamente',
                idasignacion: idasignacion
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar asignacion' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { profesores_idprofesores, demanda_iddemanda, asi_num_horas } = req.body;
        try {
            const actualizado = await AsignacionModel.update(id, profesores_idprofesores, demanda_iddemanda, asi_num_horas);
            if (!actualizado) return res.status(404).json({ message: "Asignacion no encontrada" });
            res.status(200).json({ message: 'Asignacion actualizada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar asignacion' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const eliminado = await AsignacionModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Asignacion no encontrada' });
            res.status(200).json({ mensaje: 'Asignacion eliminada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar asignacion' });
        }
    }
};

module.exports = AsignacionController;