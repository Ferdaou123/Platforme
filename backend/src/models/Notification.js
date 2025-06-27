const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Veuillez ajouter un message'],
    maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
  },
  titre: {
    type: String,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    default: function() {
      const titreParType = {
        'creation_compte': 'Nouveau compte créé',
        'nouveau_signalement': 'Nouveau signalement',
        'vote_recu': 'Nouveau vote reçu',
        'statut_modifie': 'Statut modifié',
        'signalement_resolu': 'Signalement résolu',
        'commentaire_ajoute': 'Nouveau commentaire',
        'signalement_archive': 'Signalement archivé',
        'info': 'Information',
        'statut': 'Mise à jour de statut',
        'réponse': 'Réponse',
        'système': 'Notification système'
      };
      return titreParType[this.type] || 'Notification';
    }
  },
  lu: {
    type: Boolean,
    default: false
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
    ref: 'Signalement'
  },
  type: {
    type: String,
    enum: [
      'info', 
      'statut', 
      'réponse', 
      'système',
      'creation_compte',
      'nouveau_signalement', 
      'vote_recu',
      'statut_modifie',
      'signalement_resolu',
      'commentaire_ajoute',
      'signalement_archive'
    ],
    default: 'info'
  },
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'haute'],
    default: 'normale'
  },
  donneesSupplement: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

NotificationSchema.index({ utilisateur: 1, lu: 1, dateCréation: -1 });
NotificationSchema.index({ type: 1, dateCréation: -1 });
NotificationSchema.index({ dateCréation: -1 });

NotificationSchema.virtual('age').get(function() {
  return Date.now() - this.dateCréation;
});

NotificationSchema.virtual('estRecente').get(function() {
  const unJour = 24 * 60 * 60 * 1000;
  return (Date.now() - this.dateCréation) < unJour;
});

NotificationSchema.methods.marquerCommeLue = function() {
  this.lu = true;
  return this.save();
};

NotificationSchema.statics.compterNonLues = function(utilisateurId) {
  return this.countDocuments({
    utilisateur: utilisateurId,
    lu: false
  });
};

NotificationSchema.statics.marquerToutesCommeLues = function(utilisateurId) {
  return this.updateMany(
    { utilisateur: utilisateurId, lu: false },
    { lu: true }
  );
};

NotificationSchema.pre('save', function(next) {
  if (!this.titre) {
    const titreParType = {
      'creation_compte': 'Nouveau compte créé',
      'nouveau_signalement': 'Nouveau signalement',
      'vote_recu': 'Nouveau vote reçu',
      'statut_modifie': 'Statut modifié',
      'signalement_resolu': 'Signalement résolu',
      'commentaire_ajoute': 'Nouveau commentaire',
      'signalement_archive': 'Signalement archivé',
      'info': 'Information',
      'statut': 'Mise à jour de statut',
      'réponse': 'Réponse',
      'système': 'Notification système'
    };
    this.titre = titreParType[this.type] || 'Notification';
  }
  next();
});

NotificationSchema.statics.nettoyerAnciennes = function(joursAnciennete = 30) {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - joursAnciennete);
  
  return this.deleteMany({
    dateCréation: { $lt: dateLimit },
    lu: true
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);