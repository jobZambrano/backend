const DemandaModel = require('../models/demandaModel');

const DemandaController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const demanda = await DemandaModel.getById(id);
            if (!demanda) return res.status(404).json({ error: 'Demanda no encontrada' });
            res.json(demanda);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener la demanda' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await DemandaModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las demandas' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos } = req.body;

        try {
            const existe = await DemandaModel.existsByRelacion(carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas);
            if (existe) {
                return res.status(409).json({ error: 'La demanda ya existe para esta carrera, periodo y asignatura' });
            }

            const iddemanda = await DemandaModel.create({
                carreras_idcarreras,
                periodos_idperiodos,
                asignaturas_idasignaturas,
                dem_nivel,
                dem_num_hor_clase,
                dem_num_estudiantes,
                dem_num_paralelos
            });

            res.status(201).json({
                message: 'Demanda insertada correctamente',
                iddemanda: iddemanda
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al insertar demanda' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { carreras_idcarreras, periodos_idperiodos, asignaturas_idasignaturas, dem_nivel, dem_num_hor_clase, dem_num_estudiantes, dem_num_paralelos } = req.body;

        try {
            const actualizado = await DemandaModel.update(id, {
                carreras_idcarreras,
                periodos_idperiodos,
                asignaturas_idasignaturas,
                dem_nivel,
                dem_num_hor_clase,
                dem_num_estudiantes,
                dem_num_paralelos
            });

            if (!actualizado) return res.status(404).json({ message: "Demanda no encontrada" });

            res.status(200).json({ message: 'Demanda actualizada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al actualizar demanda' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;

        try {
            const tieneAsignaciones = await DemandaModel.hasAsignaciones(id);
            if (tieneAsignaciones) {
                return res.status(409).json({ error: 'Demanda no se puede eliminar porque tiene una asignacion de actividad registrada' });
            }

            const eliminado = await DemandaModel.delete(id);
            if (!eliminado) return res.status(404).json({ mensaje: 'Demanda no encontrada' });

            res.status(200).json({ mensaje: 'Demanda eliminada correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar demanda' });
        }
    }
};

module.exports = DemandaController;