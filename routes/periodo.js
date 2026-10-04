const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../utils/auth");

router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM periodos WHERE idperiodos = ?",
      [id],
    );
    if (results.length === 0)
      return res.status(404).json({ error: "Periodo no encontrado" });
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el periodo" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const cadena = req.query.cadena;

    let whereClause = "";
    let queryParams = [];
    if (cadena) {
      whereClause = "WHERE per_nombre LIKE ?";
      queryParams.push(`%${cadena}%`);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM periodos ${whereClause}`,
      queryParams,
    );
    const totalPeriodos = countResult[0].total;
    const totalPages = Math.ceil(totalPeriodos / limit);

    const queryParamsPaginados = [...queryParams, limit, offset];
    const [periodosResult] = await db.query(
      `SELECT * FROM periodos ${whereClause} LIMIT ? OFFSET ?`,
      queryParamsPaginados,
    );

    res.json({
      totalItems: totalPeriodos,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
      data: periodosResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los periodos" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { per_nombre, per_activa, per_mostrar } = req.body;
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) as contador FROM periodos WHERE per_nombre = ?",
      [per_nombre],
    );
    if (result[0].contador > 0) {
      return res
        .status(409)
        .json({ error: "El periodo con nombre " + per_nombre + " ya existe" });
    }

    const [insertResult] = await db.query(
      "INSERT INTO periodos VALUES(null,?,?,?)",
      [per_nombre, per_activa, per_mostrar],
    );
    res.status(201).json({
      message: "Periodo insertado correctamente",
      idperiodos: insertResult.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al insertar periodo" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { per_nombre, per_activa, per_mostrar } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE periodos SET per_nombre = ?, per_activa = ?, per_mostrar = ? WHERE idperiodos = ?",
      [per_nombre, per_activa, per_mostrar, id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Periodo no encontrado" });
    res.status(200).json({ message: "Periodo actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar periodo" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) as contador FROM demanda WHERE periodos_idperiodos = ?",
      [id],
    );
    if (result[0].contador > 0) {
      return res
        .status(409)
        .json({
          error:
            "Periodo no se puede eliminar porque tiene una demanda registrada",
        });
    }

    const [deleteResult] = await db.query(
      "DELETE FROM periodos WHERE idperiodos = ?",
      [id],
    );
    if (deleteResult.affectedRows === 0)
      return res.status(404).json({ mensaje: "Periodo no encontrado" });

    res.status(200).json({ mensaje: "Periodo eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar periodo" });
  }
});

module.exports = router;
