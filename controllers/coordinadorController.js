const CoordinadorModel = require('../models/coordinadorModel');

const CoordinadorController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const coordinador = await CoordinadorModel.getById(id);
            if (!coordinador) return res.status(404).json({ error: 'Coordinador no encontrado' });
            res.json(coordinador);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener el coordinador' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await CoordinadorModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener los coordinadores' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { profesores_idprofesores, carreras_idcarreras, coo_rol } = req.body;
        try {
            const existe = await CoordinadorModel.existsByRelacion(profesores_idprofesores, carreras_idcarreras, coo_rol);
            if (existe) {
                return res.status(409).json({ error: 'El coordinador ya existe para este profesor, carrera y rol' });
            }

            const idcoordinadores = await CoordinadorModel.create(profesores_idprofesores, carreras_idcarreras, coo_rol);

            res.status(201).json({
                message: 'Coordinador insertado correctamente',
                idcoordinadores: idcoordinadores
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar coordinador' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { profesores_idprofesores, carreras_idcarreras, coo_rol } = req.body;
        try {
            const actualizado = await CoordinadorModel.update(id, profesores_idprofesores, carreras_idcarreras, coo_rol);
            if (!actualizado) return res.status(404).json({ message: "Coordinador no encontrado" });
            res.status(200).json({ message: 'Coordinador actualizado correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar coordinador' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const eliminado = await CoordinadorModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Coordinador no encontrado' });
            res.status(200).json({ mensaje: 'Coordinador eliminado correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar coordinador' });
        }
    }
};

module.exports = CoordinadorController;