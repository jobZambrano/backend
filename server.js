const express = require("express");
const cors = require("cors");
const { renovarToken } = require("./utils/auth");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
// Middleware para renovar el token en cada respuesta exitosa
app.use(renovarToken);
app.use(express.json());

app.use('/api/actividad', require('./routes/actividad'));
app.use('/api/asignacion', require('./routes/asignacion'));
app.use('/api/asignacionActividad', require('./routes/asignacionActividad'));
app.use('/api/asignaturas', require('./routes/asignaturas'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/carreras', require('./routes/carreras'));
app.use('/api/coordinadores', require('./routes/coordinadores'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/demanda', require('./routes/demanda'));
app.use('/api/periodo', require('./routes/periodo'));
app.use('/api/profesor', require('./routes/profesor'));

//ruta de ejemplo
app.get("/", (req, res) => {
  res.send("Hola desde el servidor express");
});

// inicar el servidor

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
