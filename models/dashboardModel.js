const db = require('../db');

const DashboardModel = {
    // Obtener totales para el dashboard
    getTotales: async () => {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM carreras) AS Carreras,
                (SELECT COUNT(*) FROM profesores) AS Profesores,
                (SELECT COUNT(*) FROM asignaturas) AS Asignaturas
        `;
        const [results] = await db.query(query);
        return results[0];
    },

    // Obtener las últimas 4 asignaturas
    getUltimasAsignaturas: async () => {
        const query = 'SELECT * FROM asignaturas ORDER BY idasignaturas DESC LIMIT 4';
        const [results] = await db.query(query);
        return results;
    },

    // Obtener las últimas 4 carreras
    getUltimasCarreras: async () => {
        const query = 'SELECT * FROM carreras ORDER BY idcarreras DESC LIMIT 4';
        const [results] = await db.query(query);
        return results;
    }
};

module.exports = DashboardModel;