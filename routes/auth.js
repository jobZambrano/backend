const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateToken } = require('../utils/auth');

router.post('/login', async (req, res) => {
  const { pro_email, pro_password } = req.body;

  // 1. Validar que no lleguen datos vacíos
  if (!pro_email || !pro_password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  try {
    // 2. Consulta a la base de datos (db.js exporta pool.promise(), por eso usamos await)
    const [results] = await db.query('SELECT idprofesores, pro_email, pro_password FROM profesores WHERE pro_email = ?', [pro_email]);

    // 3. Verificar si se encontró el usuario
    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario y contraseña incorrecta' });
    }

    const user = results[0];

    // 4. Comparación de contraseña encriptada de forma segura
    const isPasswordValid = await bcrypt.compare(pro_password, user.pro_password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuario y contraseña incorrecta' });
    }

    // 5. Generar token y responder
    const token = generateToken({ id: user.idprofesores, pro_email: user.pro_email });

    return res.json({
      message: 'Logueo exitoso',
      token
    });

  } catch (err) {
    console.error('Error en el login:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;