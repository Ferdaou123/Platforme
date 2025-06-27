const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  nomService: {
    type: String,
    required: [true, 'Veuillez ajouter un nom de service'],
    unique: true,
    trim: true,
    maxlength: [100, 'Le nom du service ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
 
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema);