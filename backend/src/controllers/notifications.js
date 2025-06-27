const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

let NotificationService;
try {
  NotificationService = require('../utils/notificationService');
} catch (error) {
  NotificationService = null;
}

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filters = { utilisateur: req.user.id };
  
  if (req.query.lu !== undefined) {
    filters.lu = req.query.lu === 'true';
  }
  
  if (req.query.type) {
    filters.type = req.query.type;
  }

  const notifications = await Notification.find(filters)
    .populate('signalement', 'titre')
    .sort({ dateCréation: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(filters);
  const nonLues = await Notification.countDocuments({
    utilisateur: req.user.id,
    lu: false
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    nonLues,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    },
    data: notifications
  });
});

exports.getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)
    .populate('signalement', 'titre description');

  if (!notification) {
    return next(new ErrorResponse(`Notification non trouvée avec l'id ${req.params.id}`, 404));
  }

  if (notification.utilisateur.toString() !== req.user.id) {
    return next(new ErrorResponse(`L'utilisateur ${req.user.id} n'est pas autorisé à accéder à cette notification`, 401));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

exports.createNotification = asyncHandler(async (req, res, next) => {
  if (!req.body.utilisateur) {
    req.body.utilisateur = req.user.id;
  }

  const notification = await Notification.create(req.body);

  res.status(201).json({
    success: true,
    data: notification
  });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification non trouvée avec l'id ${req.params.id}`, 404));
  }

  if (notification.utilisateur.toString() !== req.user.id) {
    return next(new ErrorResponse(`L'utilisateur ${req.user.id} n'est pas autorisé à modifier cette notification`, 401));
  }

  if (NotificationService && typeof NotificationService.marquerCommeLu === 'function') {
    try {
      notification = await NotificationService.marquerCommeLu(req.params.id, req.user.id);
    } catch (error) {
      console.error('Erreur service notification:', error);
      notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { lu: true },
        { new: true, runValidators: true }
      );
    }
  } else {
    notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { lu: true },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  if (NotificationService && typeof NotificationService.marquerToutesCommeLues === 'function') {
    try {
      await NotificationService.marquerToutesCommeLues(req.user.id);
    } catch (error) {
      console.error('Erreur service notification:', error);
      await Notification.updateMany(
        { utilisateur: req.user.id, lu: false },
        { lu: true }
      );
    }
  } else {
    await Notification.updateMany(
      { utilisateur: req.user.id, lu: false },
      { lu: true }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Toutes les notifications ont été marquées comme lues'
  });
});

exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification non trouvée avec l'id ${req.params.id}`, 404));
  }

  if (
    notification.utilisateur.toString() !== req.user.id &&
    req.user.rôle !== 'admin'
  ) {
    return next(new ErrorResponse(`L'utilisateur ${req.user.id} n'est pas autorisé à supprimer cette notification`, 401));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification supprimée'
  });
});

exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  let count;
  
  if (NotificationService && typeof NotificationService.compterNonLues === 'function') {
    try {
      count = await NotificationService.compterNonLues(req.user.id);
    } catch (error) {
      console.error('Erreur service notification:', error);
      count = await Notification.countDocuments({
        utilisateur: req.user.id,
        lu: false
      });
    }
  } else {
    count = await Notification.countDocuments({
      utilisateur: req.user.id,
      lu: false
    });
  }

  res.status(200).json({
    success: true,
    data: { count }
  });
});

exports.getNotificationStats = asyncHandler(async (req, res, next) => {
  const stats = await Notification.aggregate([
    { $match: { utilisateur: req.user._id } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        nonLues: {
          $sum: { $cond: [{ $eq: ['$lu', false] }, 1, 0] }
        }
      }
    }
  ]);

  const total = await Notification.countDocuments({ utilisateur: req.user.id });
  const totalNonLues = await Notification.countDocuments({
    utilisateur: req.user.id,
    lu: false
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      totalNonLues,
      parType: stats
    }
  });
});

exports.cleanupNotifications = asyncHandler(async (req, res, next) => {
  if (req.user.rôle !== 'admin') {
    return next(new ErrorResponse('Accès refusé', 403));
  }

  const jours = parseInt(req.query.days, 10) || 30;
  
  let result;
  
  if (NotificationService && typeof NotificationService.supprimerAnciennesNotifications === 'function') {
    try {
      result = await NotificationService.supprimerAnciennesNotifications(jours);
    } catch (error) {
      console.error('Erreur service notification:', error);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - jours);
      
      result = await Notification.deleteMany({
        dateCréation: { $lt: dateLimit },
        lu: true
      });
    }
  } else {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - jours);
    
    result = await Notification.deleteMany({
      dateCréation: { $lt: dateLimit },
      lu: true
    });
  }

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} notifications anciennes supprimées`,
    data: result
  });
});