const mongoose = require('mongoose');

const CommentaireSchema = new mongoose.Schema({
  contenu: {
    type: String,
    required: [true, 'Veuillez ajouter un contenu au commentaire'],
    trim: true,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  dateCréation: {
    type: Date,
    default: Date.now
  },
  utilisateur: {
    type: mongoose.Schema.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  signalement: {
    type: mongoose.Schema.ObjectId,
    ref: 'Signalement',
    required: true
  },
  commentaireParent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Commentaire',
    default: null
  },
  statut: {
    type: String,
    enum: ['actif', 'supprimé', 'modéré'],
    default: 'actif'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CommentaireSchema.index({ signalement: 1, dateCréation: -1 });
CommentaireSchema.index({ utilisateur: 1 });

CommentaireSchema.virtual('réponses', {
  ref: 'Commentaire',
  localField: '_id',
  foreignField: 'commentaireParent',
  justOne: false
});

CommentaireSchema.post('save', async function() {
  try {
    const Signalement = mongoose.model('Signalement');
    const count = await this.constructor.countDocuments({ 
      signalement: this.signalement,
      statut: 'actif'
    });
    
    await Signalement.findByIdAndUpdate(
      this.signalement,
      { compteurCommentaires: count },
      { new: true }
    );
  } catch (err) {
    console.error('Erreur lors de la mise à jour du compteur de commentaires:', err);
  }
});

CommentaireSchema.post('remove', async function() {
  try {
    const Signalement = mongoose.model('Signalement');
    const count = await this.constructor.countDocuments({ 
      signalement: this.signalement,
      statut: 'actif'
    });
    
    await Signalement.findByIdAndUpdate(
      this.signalement,
      { compteurCommentaires: count },
      { new: true }
    );
  } catch (err) {
    console.error('Erreur lors de la mise à jour du compteur de commentaires:', err);
  }
});

module.exports = mongoose.model('Commentaire', CommentaireSchema);