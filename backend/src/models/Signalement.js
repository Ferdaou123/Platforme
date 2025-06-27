const mongoose = require('mongoose');

const SignalementSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Veuillez ajouter un titre'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'Veuillez ajouter une description'],
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  dateCréation: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['attente', 'cours', 'résolu'],
    default: 'attente'
  },
  photoUrl: {
    type: String,
  },
  position: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      required: true
    },
    adresse: String
  },
  utilisateur: {
    type: mongoose.Schema.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  catégorie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Categorie',
    required: true
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service'
  },
  compteurVotes: {
    type: Number,
    default: 0
  },
  // NOUVEAU : Compteur de commentaires
  compteurCommentaires: {
    type: Number,
    default: 0
  },
  dateRésolution: Date,
  commentaireRésolution: String,
  archivé: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Inverser la relation pour les votes (virtual)
SignalementSchema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'signalement',
  justOne: false
});

// NOUVEAU : Virtual pour récupérer les commentaires
SignalementSchema.virtual('commentaires', {
  ref: 'Commentaire',
  localField: '_id',
  foreignField: 'signalement',
  justOne: false,
  match: { statut: 'actif' }
});

// Middleware pour mettre à jour le compteur de votes
SignalementSchema.pre('save', async function (next) {
  if (this.isModified('compteurVotes')) {
    return next();
  }
  
  try {
    const Vote = mongoose.model('Vote');
    const count = await Vote.countDocuments({ signalement: this._id });
    this.compteurVotes = count;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Signalement', SignalementSchema);