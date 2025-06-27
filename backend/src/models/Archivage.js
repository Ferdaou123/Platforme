const mongoose = require('mongoose');

const ArchivageSchema = new mongoose.Schema({
  signalement: {
    type: mongoose.Schema.ObjectId,
    ref: 'Signalement',
    required: true,
    unique: true
  },
  dateArchivage: {
    type: Date,
    default: Date.now
  },
  raison: {
    type: String,
    required: [true, 'Veuillez ajouter une raison d\'archivage'],
    maxlength: [500, 'La raison ne peut pas dépasser 500 caractères']
  },
  archivedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
});

// Middleware pour mettre à jour le statut d'archivage dans le signalement
ArchivageSchema.post('save', async function() {
  try {
    const Signalement = mongoose.model('Signalement');
    await Signalement.findByIdAndUpdate(
      this.signalement,
      { archivé: true },
      { new: true }
    );
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut d\'archivage:', err);
  }
});

module.exports = mongoose.model('Archivage', ArchivageSchema);