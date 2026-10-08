const PeriodoModel = require('../models/periodoModel');

const PeriodoController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const periodo = await PeriodoModel.getById(id);
            if (!periodo) return res.status(404).json({ error: 'Periodo no encontrado' });
            res.json(periodo);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener el periodo' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await PeriodoModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener los periodos' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { per_nombre, per_activa, per_mostrar } = req.body;
        try {
            const existe = await PeriodoModel.existsByName(per_nombre);
            if (existe) {
                return res.status(409).json({ error: 'El periodo con nombre ' + per_nombre + ' ya existe' });
            }

            const idperiodos = await PeriodoModel.create(per_nombre, per_activa, per_mostrar);

            res.status(201).json({
                message: 'Periodo insertado correctamente',
                idperiodos: idperiodos
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar periodo' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { per_nombre, per_activa, per_mostrar } = req.body;
        try {
            const actualizado = await PeriodoModel.update(id, per_nombre, per_activa, per_mostrar);
            if (!actualizado) return res.status(404).json({ message: 'Periodo no encontrado' });
            res.status(200).json({ message: 'Periodo actualizado correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar periodo' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const tieneDemandas = await PeriodoModel.hasDemandas(id);
            if (tieneDemandas) {
                return res.status(409).json({ error: 'Periodo no se puede eliminar porque tiene una demanda registrada' });
            }

            const eliminado = await PeriodoModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Periodo no encontrado' });

            res.status(200).json({ mensaje: 'Periodo eliminado correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar periodo' });
        }
    }
};

module.exports = PeriodoController;