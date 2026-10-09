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
    // const [results] = await db.query('SELECT idprofesores, pro_email, pro_password, rol FROM profesores WHERE pro_email = ?', [pro_email]);
    const [results] = await db.query(
      `SELECT 
        p.idprofesores, 
        p.pro_email, 
        p.pro_password, 
        p.rol AS rol_general,
        (SELECT coo_rol FROM coordinadores 
         WHERE profesores_idprofesores = p.idprofesores 
         AND coo_rol = 'COORDINADOR' LIMIT 1) AS es_coordinador,
        (SELECT coo_rol FROM coordinadores 
         WHERE profesores_idprofesores = p.idprofesores 
         AND coo_rol = 'COMISION ACADEMICA' LIMIT 1) AS es_comision
     FROM profesores p
     WHERE p.pro_email = ?`,
      [pro_email]    );
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

    let rolFinal;
    if (user.rol_general === "ADMINISTRADOR") {
      rolFinal = "ADMINISTRADOR";
    } else if (user.es_coordinador) {
      rolFinal = "COORDINADOR";
    } else if (user.es_comision) {
      rolFinal = "COMISION ACADEMICA";
    } else {
      rolFinal = "DOCENTE";

    }
    // 5. Generar token y responder
    const token = generateToken({ id: user.idprofesores, pro_email: user.pro_email, rol: rolFinal });

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