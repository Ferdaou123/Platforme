const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Archivage = require('../models/Archivage');
const Signalement = require('../models/Signalement');

let NotificationService;
try {
  NotificationService = require('../utils/notificationService');
} catch (error) {
  NotificationService = null;
}

exports.getArchivages = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getArchivage = asyncHandler(async (req, res, next) => {
  const archivage = await Archivage.findById(req.params.id)
    .populate({
      path: 'signalement',
      select: 'titre description statut dateCréation photoUrl position',
      populate: [
        { path: 'utilisateur', select: 'nom email' },
        { path: 'catégorie', select: 'nomCategorie' }
      ]
    })
    .populate('archivedBy', 'nom email');

  if (!archivage) {
    return next(
      new ErrorResponse(`Archivage non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: archivage
  });
});

exports.createArchivage = asyncHandler(async (req, res, next) => {
  const signalement = await Signalement.findById(req.body.signalement)
    .populate('utilisateur', 'nom email');
  
  if (!signalement) {
    return next(new ErrorResponse('Signalement non trouvé', 404));
  }

  const existingArchivage = await Archivage.findOne({ 
    signalement: req.body.signalement 
  });
  
  if (existingArchivage) {
    return next(new ErrorResponse('Ce signalement est déjà archivé', 400));
  }

  req.body.archivedBy = req.user.id;

  const archivage = await Archivage.create(req.body);

  await archivage.populate([
    {
      path: 'signalement',
      select: 'titre description statut dateCréation',
      populate: [
        { path: 'utilisateur', select: 'nom email' },
        { path: 'catégorie', select: 'nomCategorie' }
      ]
    },
    { path: 'archivedBy', select: 'nom email' }
  ]);

  setImmediate(async () => {
    try {
      if (NotificationService && typeof NotificationService.notifierArchivage === 'function') {
        await NotificationService.notifierArchivage(signalement, req.user);
      } else {
        const Notification = require('../models/Notification');
        await Notification.create({
          message: `Votre signalement "${signalement.titre}" a été archivé par ${req.user.nom}`,
          utilisateur: signalement.utilisateur._id,
          signalement: signalement._id,
          type: 'système',
          titre: 'Signalement archivé'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la notification d\'archivage:', error);
    }
  });

  res.status(201).json({
    success: true,
    data: archivage
  });
});

exports.updateArchivage = asyncHandler(async (req, res, next) => {
  let archivage = await Archivage.findById(req.params.id);

  if (!archivage) {
    return next(
      new ErrorResponse(`Archivage non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  const allowedFields = ['raison'];
  const updateData = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  archivage = await Archivage.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate([
    {
      path: 'signalement',
      select: 'titre description statut dateCréation',
      populate: [
        { path: 'utilisateur', select: 'nom email' },
        { path: 'catégorie', select: 'nomCategorie' }
      ]
    },
    { path: 'archivedBy', select: 'nom email' }
  ]);

  res.status(200).json({
    success: true,
    data: archivage
  });
});

exports.deleteArchivage = asyncHandler(async (req, res, next) => {
  const archivage = await Archivage.findById(req.params.id)
    .populate({
      path: 'signalement',
      select: 'titre utilisateur',
      populate: { path: 'utilisateur', select: 'nom email' }
    });

  if (!archivage) {
    return next(
      new ErrorResponse(`Archivage non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  await Signalement.findByIdAndUpdate(
    archivage.signalement._id,
    { archivé: false },
    { new: true }
  );

  setImmediate(async () => {
    try {
      if (NotificationService && typeof NotificationService.creerNotification === 'function') {
        await NotificationService.creerNotification({
          utilisateurId: archivage.signalement.utilisateur._id,
          type: 'système',
          titre: 'Signalement désarchivé',
          message: `Votre signalement "${archivage.signalement.titre}" a été désarchivé par ${req.user.nom}`,
          signalement: archivage.signalement._id,
          priorite: 'normale',
          donneesSupplement: {
            titre_signalement: archivage.signalement.titre,
            desarchive_par: req.user.nom
          }
        });
      } else {
        const Notification = require('../models/Notification');
        await Notification.create({
          message: `Votre signalement "${archivage.signalement.titre}" a été désarchivé par ${req.user.nom}`,
          utilisateur: archivage.signalement.utilisateur._id,
          signalement: archivage.signalement._id,
          type: 'système',
          titre: 'Signalement désarchivé'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la notification de désarchivage:', error);
    }
  });

  await archivage.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Signalement désarchivé avec succès'
  });
});

exports.getArchivedSignalements = asyncHandler(async (req, res, next) => {
  const archivages = await Archivage.find()
    .populate({
      path: 'signalement',
      select: 'titre description statut dateCréation photoUrl position compteurVotes',
      populate: [
        { path: 'utilisateur', select: 'nom email' },
        { path: 'catégorie', select: 'nomCategorie' },
        { path: 'service', select: 'nomService' }
      ]
    })
    .populate('archivedBy', 'nom email')
    .sort('-dateArchivage');

  const validArchivages = archivages.filter(archivage => archivage.signalement);

  res.status(200).json({
    success: true,
    count: validArchivages.length,
    data: validArchivages
  });
});

exports.getArchivageStats = asyncHandler(async (req, res, next) => {
  const stats = await Archivage.aggregate([
    {
      $lookup: {
        from: 'signalements',
        localField: 'signalement',
        foreignField: '_id',
        as: 'signalementData'
      }
    },
    {
      $unwind: '$signalementData'
    },
    {
      $group: {
        _id: null,
        totalArchivages: { $sum: 1 },
        archivagesParMois: {
          $push: {
            $dateToString: {
              format: '%Y-%m',
              date: '$dateArchivage'
            }
          }
        },
        archivagesParStatut: {
          $push: '$signalementData.statut'
        }
      }
    }
  ]);

  const archivagesParMois = {};
  if (stats.length > 0) {
    stats[0].archivagesParMois.forEach(mois => {
      archivagesParMois[mois] = (archivagesParMois[mois] || 0) + 1;
    });
  }

  const archivagesParStatut = {};
  if (stats.length > 0) {
    stats[0].archivagesParStatut.forEach(statut => {
      archivagesParStatut[statut] = (archivagesParStatut[statut] || 0) + 1;
    });
  }

  res.status(200).json({
    success: true,
    data: {
      totalArchivages: stats.length > 0 ? stats[0].totalArchivages : 0,
      archivagesParMois,
      archivagesParStatut
    }
  });
});