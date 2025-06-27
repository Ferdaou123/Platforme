const express = require('express');
const {
  getNotifications,
  getNotification,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationStats,
  cleanupNotifications
} = require('../controllers/notifications');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin', 'technicien'), createNotification);

router.route('/read-all').put(protect, markAllAsRead);

router.route('/unread-count').get(protect, getUnreadCount ? getUnreadCount : async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const count = await Notification.countDocuments({
      utilisateur: req.user.id,
      lu: false
    });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors du comptage des notifications' });
  }
});

router.route('/stats').get(protect, getNotificationStats ? getNotificationStats : async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const total = await Notification.countDocuments({ utilisateur: req.user.id });
    const totalNonLues = await Notification.countDocuments({
      utilisateur: req.user.id,
      lu: false
    });
    
    res.status(200).json({
      success: true,
      data: { total, totalNonLues, parType: [] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des statistiques' });
  }
});

router.route('/cleanup').delete(protect, authorize('admin'), cleanupNotifications ? cleanupNotifications : async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const jours = parseInt(req.query.days, 10) || 30;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - jours);
    
    const result = await Notification.deleteMany({
      dateCréation: { $lt: dateLimit },
      lu: true
    });
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications anciennes supprimées`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors du nettoyage des notifications' });
  }
});

router
  .route('/:id')
  .get(protect, getNotification)
  .delete(protect, deleteNotification);

router.route('/:id/read').put(protect, markAsRead);

module.exports = router;