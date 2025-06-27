const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const Utilisateur = require('../models/Utilisateur');
const NotificationService = require('../utils/notificationService');

exports.register = async (req, res, next) => {
  try {
    const { nom, email, mot_de_passe, rôle } = req.body;

    const user = await Utilisateur.create({
      nom,
      email,
      mot_de_passe,
      rôle: rôle || 'citoyen'
    });

    if (user) {
      setImmediate(async () => {
        try {
          await NotificationService.notifierCreationCompte(user);
        } catch (error) {
          console.error('Erreur lors de la notification de création de compte:', error);
        }
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const user = await Utilisateur.findOne({ email }).select('+mot_de_passe');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    const isMatch = await user.matchPassword(mot_de_passe);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await Utilisateur.findById(req.user.id);
    
    let notificationsNonLues = 0;
    try {
      if (NotificationService && typeof NotificationService.compterNonLues === 'function') {
        notificationsNonLues = await NotificationService.compterNonLues(req.user.id);
      } else {
        const Notification = require('../models/Notification');
        notificationsNonLues = await Notification.countDocuments({
          utilisateur: req.user.id,
          lu: false
        });
      }
    } catch (notifError) {
      console.error('Erreur lors du comptage des notifications:', notifError);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        notificationsNonLues
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      nom: req.body.nom,
      email: req.body.email
    };

    const user = await Utilisateur.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await Utilisateur.findById(req.user.id).select('+mot_de_passe');

    if (!(await user.matchPassword(req.body.mot_de_passe_actuel))) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe incorrect'
      });
    }

    user.mot_de_passe = req.body.nouveau_mot_de_passe;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await Utilisateur.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const message = `
      <h1>Vous avez demandé une réinitialisation de mot de passe</h1>
      <p>Vous recevez cet e-mail car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe.</p>
      <p>Veuillez cliquer sur ce lien pour réinitialiser votre mot de passe:</p>
      <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser le mot de passe</a>
      <p>Ce lien expire dans 10 minutes.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Réinitialisation du mot de passe - Essaouira Fix',
        message
      });

      res.status(200).json({
        success: true,
        data: 'Email envoyé'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email n\'a pas pu être envoyé'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await Utilisateur.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }

    user.mot_de_passe = req.body.password || req.body.mot_de_passe;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const jwtCookieExpire = process.env.JWT_COOKIE_EXPIRE || 30;
  
  const options = {
    expires: new Date(Date.now() + jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};