const bcrypt = require('bcrypt');
const ProfesorModel = require('../models/profesorModel');

const ProfesorController = {
    // GET /:id
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const docente = await ProfesorModel.getById(id);
            if (!docente) {
                return res.status(404).json({ error: 'Docente no encontrado' });
            }
            res.json(docente);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'error al obtener el Docente' });
        }
    },

    // GET /
    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const cadena = req.query.cadena;

            const resultado = await ProfesorModel.getAll(limit, offset, cadena);

            res.json({
                totalItems: resultado.totalItems,
                totalPages: resultado.totalPages,
                currentPage: page,
                limit: limit,
                data: resultado.data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener docentes' });
        }
    },

    // POST /
    create: async (req, res) => {
        const { pro_apellidosNombres, pro_cedula, pro_email, pro_password, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto } = req.body;

        try {
            const existe = await ProfesorModel.existsByCedula(pro_cedula);
            if (existe) {
                return res.status(409).json({ error: "El docente con cédula: " + pro_cedula + " ya existe" });
            }

            const claveHasheada = await bcrypt.hash(pro_password, 12);

            const id_profesor = await ProfesorModel.create({
                pro_apellidosNombres,
                pro_cedula,
                pro_email,
                pro_password: claveHasheada,
                pro_tipo,
                pro_sexo,
                pro_categoria,
                pro_titulo_tercer,
                pro_titulo_cuarto,
                pro_tipo_cuarto
            });

            res.status(201).json({
                message: 'Docente insertado correctamente',
                id_profesor: id_profesor
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno al procesar la solicitud' });
        }
    },

    // PUT /:id
    update: async (req, res) => {
        const { id } = req.params;
        const { pro_apellidosNombres, pro_cedula, pro_email, pro_password, pro_tipo, pro_sexo, pro_categoria, pro_titulo_tercer, pro_titulo_cuarto, pro_tipo_cuarto } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(pro_password, 12);

            const actualizado = await ProfesorModel.update(id, {
                pro_apellidosNombres,
                pro_cedula,
                pro_email,
                pro_password: hashedPassword,
                pro_tipo,
                pro_sexo,
                pro_categoria,
                pro_titulo_tercer,
                pro_titulo_cuarto,
                pro_tipo_cuarto
            });

            if (!actualizado) {
                return res.status(404).json({ message: 'Docente no encontrado' });
            }

            res.status(200).json({ message: 'Docente actualizado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno al procesar la solicitud' });
        }
    },

    // DELETE /:id
    delete: async (req, res) => {
        const { id } = req.params;

        try {
            const existe = await ProfesorModel.existsById(id);
            if (!existe) {
                return res.status(404).json({ message: 'Docente no encontrado' });
            }

            await ProfesorModel.delete(id);

            res.status(200).json({
                message: 'Docente eliminado correctamente',
                idprofesor: id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar docente' });
        }
    }
};

module.exports = ProfesorController;