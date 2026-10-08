const CarreraModel = require('../models/carreraModel');

const CarreraController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const carrera = await CarreraModel.getById(id);
            if (!carrera) return res.status(404).json({ error: 'Carrera no encontrada' });
            res.json(carrera);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener la carrera' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await CarreraModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las carreras' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { car_nombre, car_alias } = req.body;
        try {
            const existe = await CarreraModel.existsByName(car_nombre);
            if (existe) {
                return res.status(409).json({ error: 'La carrera con nombre ' + car_nombre + ' ya existe' });
            }

            const idcarreras = await CarreraModel.create(car_nombre, car_alias);

            res.status(201).json({
                message: 'Carrera insertada correctamente',
                idcarreras: idcarreras
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar carrera' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { car_nombre, car_alias } = req.body;
        try {
            const actualizado = await CarreraModel.update(id, car_nombre, car_alias);
            if (!actualizado) return res.status(404).json({ message: "Carrera no encontrada" });
            res.status(200).json({ message: 'Carrera actualizada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar carrera' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const tieneAsignaturas = await CarreraModel.hasAsignaturas(id);
            if (tieneAsignaturas) {
                return res.status(409).json({ error: 'Carrera no se puede eliminar porque tiene asignaturas registradas' });
            }

            const eliminado = await CarreraModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Carrera no encontrada' });

            res.status(200).json({ mensaje: 'Carrera eliminada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar carrera' });
        }
    }
};

module.exports = CarreraController;