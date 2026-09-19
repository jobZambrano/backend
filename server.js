const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Importar rutas
const actividadRoutes = require("./routes/actividad.routes");
const asignacionRoutes = require("./routes/asignacion.routes");
const asignacionActividadRoutes = require("./routes/asignacionActividad.routes");
const asignaturaRoutes = require("./routes/asignatura.routes");
const carreraRoutes = require("./routes/carrera.routes");
const coordinadorRoutes = require("./routes/coordinador.routes");
const dashboardRoutes = require("./routes/dashboard");
const demandaRoutes = require("./routes/demanda");

// Usar rutas en Express
app.use("/api/actividad", actividadRoutes);
app.use("/api/asignacion", asignacionRoutes);
app.use("/api/asignacion-actividad", asignacionActividadRoutes);
app.use("/api/asignatura", asignaturaRoutes);
app.use("/api/carrera", carreraRoutes);
app.use("/api/coordinador", coordinadorRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/demanda", demandaRoutes);
//ruta de ejemplo
app.get("/", (req, res) => {
  res.send("Hola desde el servidor express");
});

// inicar el servidor

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
