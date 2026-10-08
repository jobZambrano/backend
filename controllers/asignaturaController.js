const AsignaturaModel = require('../models/asignaturaModel');

const AsignaturaController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const asignatura = await AsignaturaModel.getById(id);
            if (!asignatura) return res.status(404).json({ error: 'Asignatura no encontrada' });
            res.json(asignatura);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener la asignatura' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await AsignaturaModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las asignaturas' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { asi_nombres, carreras_idcarreras, asi_activa } = req.body;
        try {
            const existe = await AsignaturaModel.existsByNombreCarrera(asi_nombres, carreras_idcarreras);
            if (existe) {
                return res.status(409).json({ error: 'La asignatura ya existe para esta carrera' });
            }

            const idasignaturas = await AsignaturaModel.create(asi_nombres, carreras_idcarreras, asi_activa);

            res.status(201).json({
                message: 'Asignatura insertada correctamente',
                idasignaturas: idasignaturas
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar asignatura' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { asi_nombres, carreras_idcarreras, asi_activa } = req.body;
        try {
            const actualizado = await AsignaturaModel.update(id, asi_nombres, carreras_idcarreras, asi_activa);
            if (!actualizado) return res.status(404).json({ message: "Asignatura no encontrada" });
            res.status(200).json({ message: 'Asignatura actualizada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar asignatura' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const tieneDemandas = await AsignaturaModel.hasDemandas(id);
            if (tieneDemandas) {
                return res.status(409).json({ error: 'Asignatura no se puede eliminar porque tiene demandas registradas' });
            }

            const eliminado = await AsignaturaModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Asignatura no encontrada' });

            res.status(200).json({ mensaje: 'Asignatura eliminada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar asignatura' });
        }
    }
};

module.exports = AsignaturaController;