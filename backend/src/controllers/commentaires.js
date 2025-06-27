const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Commentaire = require('../models/Commentaire');
const Signalement = require('../models/Signalement');
const Notification = require('../models/Notification');

exports.getCommentaires = asyncHandler(async (req, res, next) => {
  const { signalementId } = req.params;
  
  const signalement = await Signalement.findById(signalementId);
  if (!signalement) {
    return next(new ErrorResponse(`Signalement non trouvé avec l'ID ${signalementId}`, 404));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const commentaires = await Commentaire.find({
    signalement: signalementId,
    commentaireParent: null,
    statut: 'actif'
  })
    .populate({
      path: 'utilisateur',
      select: 'nom rôle'
    })
    .populate({
      path: 'réponses',
      match: { statut: 'actif' },
      populate: {
        path: 'utilisateur',
        select: 'nom rôle'
      },
      options: { sort: { dateCréation: 1 } }
    })
    .sort({ dateCréation: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Commentaire.countDocuments({
    signalement: signalementId,
    commentaireParent: null,
    statut: 'actif'
  });

  const pagination = {};
  const endIndex = page * limit;

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: commentaires.length,
    total,
    pagination,
    data: commentaires
  });
});

exports.getCommentaire = asyncHandler(async (req, res, next) => {
  const commentaire = await Commentaire.findById(req.params.id)
    .populate({
      path: 'utilisateur',
      select: 'nom rôle'
    })
    .populate({
      path: 'signalement',
      select: 'titre'
    })
    .populate({
      path: 'réponses',
      match: { statut: 'actif' },
      populate: {
        path: 'utilisateur',
        select: 'nom rôle'
      }
    });

  if (!commentaire) {
    return next(new ErrorResponse(`Commentaire non trouvé avec l'ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: commentaire
  });
});

exports.addCommentaire = asyncHandler(async (req, res, next) => {
  const { signalementId } = req.params;
  
  const signalement = await Signalement.findById(signalementId);
  if (!signalement) {
    return next(new ErrorResponse(`Signalement non trouvé avec l'ID ${signalementId}`, 404));
  }

  req.body.utilisateur = req.user.id;
  req.body.signalement = signalementId;

  if (req.body.commentaireParent) {
    const commentaireParent = await Commentaire.findById(req.body.commentaireParent);
    if (!commentaireParent) {
      return next(new ErrorResponse(`Commentaire parent non trouvé avec l'ID ${req.body.commentaireParent}`, 404));
    }
    
    if (commentaireParent.signalement.toString() !== signalementId) {
      return next(new ErrorResponse('Le commentaire parent doit appartenir au même signalement', 400));
    }
  }

  const commentaire = await Commentaire.create(req.body);

  await commentaire.populate({
    path: 'utilisateur',
    select: 'nom rôle'
  });

  if (signalement.utilisateur.toString() !== req.user.id) {
    await Notification.create({
      message: `${req.user.nom} a commenté votre signalement "${signalement.titre}"`,
      utilisateur: signalement.utilisateur,
      signalement: signalementId,
      type: 'réponse'
    });
  }

  if (req.body.commentaireParent) {
    const commentaireParent = await Commentaire.findById(req.body.commentaireParent)
      .populate('utilisateur');
    
    if (commentaireParent.utilisateur._id.toString() !== req.user.id) {
      await Notification.create({
        message: `${req.user.nom} a répondu à votre commentaire sur "${signalement.titre}"`,
        utilisateur: commentaireParent.utilisateur._id,
        signalement: signalementId,
        type: 'réponse'
      });
    }
  }

  res.status(201).json({
    success: true,
    data: commentaire
  });
});

exports.updateCommentaire = asyncHandler(async (req, res, next) => {
  let commentaire = await Commentaire.findById(req.params.id);

  if (!commentaire) {
    return next(new ErrorResponse(`Commentaire non trouvé avec l'ID ${req.params.id}`, 404));
  }

  if (commentaire.utilisateur.toString() !== req.user.id && req.user.rôle !== 'admin') {
    return next(new ErrorResponse('Non autorisé à modifier ce commentaire', 403));
  }

  const { contenu } = req.body;
  
  commentaire = await Commentaire.findByIdAndUpdate(
    req.params.id,
    { contenu },
    {
      new: true,
      runValidators: true
    }
  ).populate({
    path: 'utilisateur',
    select: 'nom rôle'
  });

  res.status(200).json({
    success: true,
    data: commentaire
  });
});

exports.deleteCommentaire = asyncHandler(async (req, res, next) => {
  const commentaire = await Commentaire.findById(req.params.id);

  if (!commentaire) {
    return next(new ErrorResponse(`Commentaire non trouvé avec l'ID ${req.params.id}`, 404));
  }

  if (commentaire.utilisateur.toString() !== req.user.id && req.user.rôle !== 'admin') {
    return next(new ErrorResponse('Non autorisé à supprimer ce commentaire', 403));
  }

  await Commentaire.findByIdAndUpdate(
    req.params.id,
    { statut: 'supprimé' },
    { new: true }
  );

  const count = await Commentaire.countDocuments({ 
    signalement: commentaire.signalement,
    statut: 'actif'
  });
  
  await Signalement.findByIdAndUpdate(
    commentaire.signalement,
    { compteurCommentaires: count },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getUserCommentaires = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  
  if (req.user.id !== userId && req.user.rôle !== 'admin') {
    return next(new ErrorResponse('Non autorisé à voir ces commentaires', 403));
  }

  const commentaires = await Commentaire.find({
    utilisateur: userId,
    statut: 'actif'
  })
    .populate({
      path: 'signalement',
      select: 'titre statut'
    })
    .sort({ dateCréation: -1 });

  res.status(200).json({
    success: true,
    count: commentaires.length,
    data: commentaires
  });
});

exports.getAllCommentaires = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  let query = {};
  
  if (req.query.search) {
    query.contenu = { $regex: req.query.search, $options: 'i' };
  }
  
  if (req.query.statut) {
    query.statut = req.query.statut;
  }
  
  if (req.query.signalement) {
    query.signalement = req.query.signalement;
  }

  const commentaires = await Commentaire.find(query)
    .populate({
      path: 'utilisateur',
      select: 'nom email rôle'
    })
    .populate({
      path: 'signalement',
      select: 'titre statut'
    })
    .sort({ dateCréation: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Commentaire.countDocuments(query);

  const pagination = {};
  const endIndex = page * limit;

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: commentaires.length,
    total,
    pagination,
    data: commentaires
  });
});

exports.moderateCommentaire = asyncHandler(async (req, res, next) => {
  const { statut } = req.body;
  
  if (!['actif', 'modéré', 'supprimé'].includes(statut)) {
    return next(new ErrorResponse('Statut invalide', 400));
  }

  const commentaire = await Commentaire.findByIdAndUpdate(
    req.params.id,
    { statut },
    {
      new: true,
      runValidators: true
    }
  ).populate({
    path: 'utilisateur',
    select: 'nom rôle'
  });

  if (!commentaire) {
    return next(new ErrorResponse(`Commentaire non trouvé avec l'ID ${req.params.id}`, 404));
  }

  const count = await Commentaire.countDocuments({ 
    signalement: commentaire.signalement,
    statut: 'actif'
  });
  
  await Signalement.findByIdAndUpdate(
    commentaire.signalement,
    { compteurCommentaires: count },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: commentaire
  });
});