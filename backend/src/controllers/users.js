const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Utilisateur = require('../models/Utilisateur');

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await Utilisateur.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const existingUser = await Utilisateur.findOne({ email: req.body.email });
  
  if (existingUser) {
    return next(new ErrorResponse('Un utilisateur avec cet email existe déjà', 400));
  }

  if (req.body.rôle && !['admin', 'citoyen'].includes(req.body.rôle)) {
    return next(new ErrorResponse('Rôle invalide. Seuls "admin" et "citoyen" sont autorisés', 400));
  }

  const user = await Utilisateur.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await Utilisateur.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé avec l'id ${req.params.id}`, 404));
  }

  if (req.body.email) {
    const existingUser = await Utilisateur.findOne({ 
      email: req.body.email,
      _id: { $ne: req.params.id }
    });
    
    if (existingUser) {
      return next(new ErrorResponse('Un autre utilisateur utilise déjà cet email', 400));
    }
  }

  if (req.body.rôle && !['admin', 'citoyen'].includes(req.body.rôle)) {
    return next(new ErrorResponse('Rôle invalide. Seuls "admin" et "citoyen" sont autorisés', 400));
  }

  if (req.body.mot_de_passe) {
    delete req.body.mot_de_passe;
  }

  user = await Utilisateur.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await Utilisateur.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé avec l'id ${req.params.id}`, 404));
  }

  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Vous ne pouvez pas supprimer votre propre compte', 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});