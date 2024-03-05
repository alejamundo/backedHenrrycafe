const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

const corsOptions = {
  origin: 'http://localhost:5173', // Replace with the origin of your React app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// Configura tu conexión a la base de datos
const client = new Client({
  user: 'postgres',
  host: 'viaduct.proxy.rlwy.net',
  database: 'railway',
  password: 'bEEGGEEga1DG*D*dE1E2d-eA1f1GE5ag',
  port: 59066,
});

client.connect();

// Función para autenticar al usuario en base de datos o cualquier otro método que utilices
const authenticateUser = async (email, pswd) => {
  try {
    // Realiza una consulta a la base de datos para verificar las credenciales
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND pswd = $2',
      [email, pswd]
    );

    // Si hay un usuario con esas credenciales, devuelve el objeto de usuario
    // De lo contrario, devuelve null
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    throw error;
  }
};

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Endpoint para registrar un nuevo usuario
app.post('/api/signup', async (req, res) => {
  try {
    const { nombre, email, pswd } = req.body;

    // Log para imprimir detalles de la solicitud
    console.log('Detalles de la solicitud:', { nombre, email, pswd });

    // Realiza la inserción en la base de datos
    const result = await client.query(
      'INSERT INTO users (name, email, pswd) VALUES ($1, $2, $3) RETURNING *',
      [nombre, email, pswd]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// En tu servidor Express
app.post('/api/signin', async (req, res) => {
  try {
    const { email, pswd } = req.body;

    // Realiza la autenticación en la base de datos o donde almacenes las credenciales
    const user = await authenticateUser(email, pswd);

    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
