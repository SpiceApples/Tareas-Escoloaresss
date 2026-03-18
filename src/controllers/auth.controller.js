const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * ==============================
 * REGISTRO (queda igual)
 * ==============================
 */
exports.register = async (req, res) => {

  if (!req.body) {
    return res.status(400).json({ error: 'Body requerido en formato JSON' });
  }

  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({
      error: 'Nombre, correo y password son obligatorios'
    });
  }

  try {

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, correo',
      [nombre, correo.toLowerCase(), passwordHash]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    if (error.code === '23505') {
      return res.status(400).json({
        error: 'El correo ya está registrado'
      });
    }

    res.status(500).json({ error: error.message });
  }
};


/**
 * ==============================
 * LOGIN con JWT
 * ==============================
 */
exports.login = async (req, res) => {

  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      error: 'Correo y password son obligatorios'
    });
  }

  try {

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const usuario = result.rows[0];

    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    //  GENERAR TOKEN
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * GOOGLE LOGIN
 * ==============================
 */
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'ID Token de Google requerido' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Buscar usuario por correo
    let result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [email.toLowerCase()]);
    let usuario;

    if (result.rows.length === 0) {
      // Crear usuario si no existe
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const insertResult = await pool.query(
        'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email.toLowerCase(), passwordHash]
      );
      usuario = insertResult.rows[0];
    } else {
      usuario = result.rows[0];
    }

    // Generar Token
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login con Google exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al verificar token de Google: ' + error.message });
  }
};

/**
 * ==============================
 * OLVIDÉ CONTRASEÑA (Solicitud)
 * ==============================
 */
exports.forgotPassword = async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: 'Correo es obligatorio' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo.toLowerCase()]);
    
    if (result.rows.length === 0) {
      // Por seguridad, no decimos si el correo existe o no
      return res.json({ message: 'Si el correo está registrado, recibirás instrucciones pronto.' });
    }

    const usuario = result.rows[0];
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await pool.query(
      'UPDATE usuarios SET reset_password_token = $1, reset_password_expires = $2 WHERE id_usuario = $3',
      [token, expires, usuario.id_usuario]
    );

    // Configurar transporte de email (usar placeholders si no hay config)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'tu_correo@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu_password_o_app_password'
      }
    });

    const resetUrl = `${req.headers.origin || 'http://localhost:5173'}?token=${token}`;

    const mailOptions = {
      from: `"Tareas Escolares Support" <${process.env.EMAIL_USER || 'noreply@tareas.com'}>`,
      to: usuario.correo,
      subject: 'Recuperación de Contraseña - Tareas Escolares',
      text: `Has solicitado restablecer tu contraseña.\n\nPor favor, haz clic en el siguiente enlace o cópialo en tu navegador para completar el proceso:\n\n${resetUrl}\n\nSi no solicitaste esto, ignora este mensaje y tu contraseña no cambiará.\n`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #7c3aed;">Tareas Escolares</h2>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el botón de abajo para elegir una nueva contraseña:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Este enlace expirará en 1 hora.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
        </div>
      `
    };

    // Intentar enviar, si falla loguear pero no romper el flujo para el cliente
    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Instrucciones enviadas al correo.' });
    } catch (mailError) {
      console.error('Error al enviar email:', mailError);
      res.json({ message: 'Error al enviar el correo, pero el token fue generado. Contacta a soporte.', token }); // Token devuelto solo para pruebas/emergencia
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==============================
 * RESTABLECER CONTRASEÑA (Ejecución)
 * ==============================
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const usuario = result.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE usuarios SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id_usuario = $2',
      [passwordHash, usuario.id_usuario]
    );

    res.json({ message: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
