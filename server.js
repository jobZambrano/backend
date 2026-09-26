const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require("./routes/auth");
const profesorRoutes = require("./routes/profesor");
const actividadRoutes = require("./routes/actividad");
const asignacionRoutes = require("./routes/asignacion");
const asignacionActividadRoutes = require("./routes/asignacionActividad");
const asignaturaRoutes = require("./routes/asignaturas");
const carreraRoutes = require("./routes/carreras");
const coordinadorRoutes = require("./routes/coordinadores");
const dashboardRoutes = require("./routes/dashboard");
const demandaRoutes = require("./routes/demanda");

// Usar rutas en Express
app.use("/api/auth", authRoutes);
app.use("/api/profesor", profesorRoutes);
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
