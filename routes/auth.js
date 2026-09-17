const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateToken } = require('../utils/auth');

router.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;
  db.query('select * from usuario where correo =?' , [correo], async (err, results) => {
    if (err) throw err;
    if (results.length == 0) {
      return res.status(401).json({ message: 'Usuario y contraseña incorrrecta' });
    }
    const user = results[0];
    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);// usar el nobre y el campo de contrasenia
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuario y contraseña incorrrecta' });
    }
    //muesta el resultado
    console.log({ id: user.id_usuario, correo: user.correo});
    console.log('logiago');
    
    const token = generateToken({ id: user.id_usuario, correo: user.correo});
    res.json({ message: 'Logueo exitoso ', token })
  });
});
module.exports = router;