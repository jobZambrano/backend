const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { Router } = require('express');


const JWT_SECRET = process.env.JWT_SECRET;

const TOKEN_EXPIRATION = '30m';
//FUNCION PARA GENERAR UN TOKEN D UN LOGEO EXITOSO
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION }); // token es valido por una hora
}
// miidlewar para vereficar token en cada peticion
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Token no porpocionado' });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.user = decoded; // agrega la informacion del ususario a la peticion 
        next(); // permite que la condision continue
    } catch (error) {
        return res.status(401).json({ message: 'Token invalido' });
    }
};
// ============================================================
// MIDDLEWARE: Renueva el token en cada respuesta exitosa
// Se aplica GLOBALMENTE en server.js
// ============================================================
const renovarToken = (req, res, next) => {
    // Guardar el método original de res.json
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para interceptar cada respuesta
    res.json = (body) => {
        // Solo renovar si:
        // 1. El usuario ya estaba autenticado (req.user existe)
        // 2. La respuesta es exitosa (status < 400)
        if (req.user && res.statusCode < 400) {
            try {
                // Generar un nuevo token con la misma info del usuario
                const nuevoToken = generateToken({
                    id: req.user.id,
                    pro_email: req.user.pro_email,
                    rol: req.user.rol,
                });

                // Enviar el nuevo token en un header personalizado
                res.setHeader('X-New-Token', nuevoToken);
            } catch (error) {
                console.error('Error al renovar token:', error);
            }
        }

        // Ejecutar el res.json original
        return originalJson(body);
    };

    next();
};

module.exports = { generateToken, verifyToken, renovarToken };