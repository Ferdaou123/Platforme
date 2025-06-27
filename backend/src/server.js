const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middlewares/error');
const connectDB = require('./config/db');
const fs = require('fs');

dotenv.config({ path: './.env' });
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

let NotificationMiddleware;
try {
  NotificationMiddleware = require('./middlewares/notificationMiddleware');
  app.use(NotificationMiddleware.postTraitement);
} catch (error) {
  console.warn('⚠️ Middleware de notifications non disponible'.yellow);
}

const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `signalement_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images JPEG, JPG, ou PNG sont autorisées'));
  }
};

exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads/images', express.static(path.join(__dirname, '../uploads/images')));
app.use('/uploads/icons', express.static(path.join(__dirname, '../uploads/icons')));

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(xss());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    retryAfter: 15 * 60
  },
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const exemptRoutes = ['/uploads/', '/api/v1/auth/me', '/api/v1/notifications/unread-count', '/api/v1/signalements/stats'];
      return exemptRoutes.some(route => req.path.includes(route));
    }
    return false;
  },
  keyGenerator: (req) => `${req.ip}-${req.get('User-Agent') || 'unknown'}`
});

app.use('/api/v1', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/v1/auth', authLimiter, require('./routes/auth'));
app.use('/api/v1/signalements', require('./routes/signalements'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/services', require('./routes/services'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/archivages', require('./routes/archivages'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/commentaires', require('./routes/commentaires'));

if (process.env.NODE_ENV === 'development') {
  app.post('/api/v1/test/notification-systeme', async (req, res) => {
    try {
      if (NotificationMiddleware && typeof NotificationMiddleware.notificationSysteme === 'function') {
        const { message, titre } = req.body;
        await NotificationMiddleware.notificationSysteme(
          message || 'Test de notification système',
          titre || 'Test'
        );
        res.json({ success: true, message: 'Notification système envoyée', data: { message, titre } });
      } else {
        res.status(503).json({ success: false, error: 'Service de notifications non disponible' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/v1/test/notification-count/:userId', async (req, res) => {
    try {
      const Notification = require('./models/Notification');
      const count = await Notification.countDocuments({
        utilisateur: req.params.userId,
        lu: false
      });
      res.json({ success: true, data: { userId: req.params.userId, count } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  try {
    const cron = require('node-cron');
    
    cron.schedule('0 2 * * 0', () => {
      if (NotificationMiddleware && typeof NotificationMiddleware.nettoyageAutomatique === 'function') {
        NotificationMiddleware.nettoyageAutomatique();
      }
    });

    cron.schedule('0 0 * * *', () => {
      console.log('Vérification quotidienne du système...'.blue);
    });
  } catch (error) {
    console.warn('node-cron non installé, tâches automatiques désactivées'.yellow);
  }
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur en mode ${process.env.NODE_ENV} sur le port ${PORT}`.yellow.bold);
});

process.on('unhandledRejection', (err) => {
  console.log(`Erreur: ${err.message}`.red);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, fermeture gracieuse...'.yellow);
  server.close(() => process.exit());
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, fermeture gracieuse...'.yellow);
  server.close(() => process.exit());
});

module.exports = app;