const mongoose = require('mongoose');

const CategorieSchema = new mongoose.Schema({
  nomCategorie: {
    type: String,
    required: [true, 'Veuillez ajouter un nom de catégorie'],
    unique: true,
    trim: true,
    maxlength: [50, 'Le nom de la catégorie ne peut pas dépasser 50 caractères']
  },
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  icone: {
    type: String,
    default: 'default-icon.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Categorie', CategorieSchema);