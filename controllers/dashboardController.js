const DashboardModel = require('../models/dashboardModel');

const DashboardController = {
    // GET /totales
    getTotales: async (req, res) => {
        try {
            const totales = await DashboardModel.getTotales();
            res.json(totales);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener los totales' });
        }
    },

    // GET /asignaturas
    getUltimasAsignaturas: async (req, res) => {
        try {
            const asignaturas = await DashboardModel.getUltimasAsignaturas();
            res.json(asignaturas);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las ultimas asignaturas' });
        }
    },

    // GET /carreras
    getUltimasCarreras: async (req, res) => {
        try {
            const carreras = await DashboardModel.getUltimasCarreras();
            res.json(carreras);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener las ultimas carreras' });
        }
    }
};

module.exports = DashboardController;