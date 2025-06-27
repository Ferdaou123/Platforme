const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Non autorisé à accéder à cette route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Utilisateur.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé à accéder à cette route'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rôle)) {
      return res.status(403).json({
        success: false,
        error: `Le rôle ${req.user.rôle} n'est pas autorisé à accéder à cette route`
      });
    }
    next();
  };
};