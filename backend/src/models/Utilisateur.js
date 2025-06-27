const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez ajouter un nom'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'Veuillez ajouter un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez ajouter un email valide'
    ]
  },
  mot_de_passe: {
    type: String,
    required: [true, 'Veuillez ajouter un mot de passe'],
    minlength: [6, 'Le mot de passe doit avoir au moins 6 caractères'],
    select: false
  },
  rôle: {
    type: String,
    enum: ['citoyen', 'admin'],
    default: 'citoyen'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Chiffrement du mot de passe avant enregistrement
UserSchema.pre('save', async function(next) {
  if (!this.isModified('mot_de_passe')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
});

// Méthode pour vérifier si le mot de passe correspond
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.mot_de_passe);
};

// Méthode pour générer le JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Méthode pour générer et hasher le token de reset password
UserSchema.methods.getResetPasswordToken = function() {
  // Générer un token aléatoire
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hasher le token et l'enregistrer dans resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Définir l'expiration du token (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // Retourner le token non hashé (celui qui sera envoyé par email)
  return resetToken;
};

module.exports = mongoose.model('Utilisateur', UserSchema);