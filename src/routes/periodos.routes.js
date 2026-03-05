const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');

// Ejemplo de ruta protegida
router.get('/', verificarToken, (req, res) => {
  res.json({
    message: 'Ruta protegida',
    usuario: req.usuario
  });
});

module.exports = router;
