const path = require('path');
const multer = require('multer');
const ErrorResponse = require('../utils/errorResponse');

// Configuration du stockage multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: function(req, file, cb) {
    // Créer un nom de fichier unique avec horodatage
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
  // Autoriser les images seulement
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Veuillez télécharger une image valide', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5000000 // 5MB max
  }
});

module.exports = upload;