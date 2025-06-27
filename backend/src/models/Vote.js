const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  signalement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signalement',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index unique pour éviter les votes multiples d'un même utilisateur
VoteSchema.index({ utilisateur: 1, signalement: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);