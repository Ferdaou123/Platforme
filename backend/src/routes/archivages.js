const express = require('express');
const {
  getArchivages,
  getArchivage,
  createArchivage,
  updateArchivage,
  deleteArchivage,
  getArchivedSignalements,
  getArchivageStats
} = require('../controllers/archivages');
const Archivage = require('../models/Archivage');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(
    advancedResults(Archivage, [
      { 
        path: 'signalement', 
        select: 'titre description statut dateCréation photoUrl',
        populate: [
          { path: 'utilisateur', select: 'nom email' },
          { path: 'catégorie', select: 'nomCategorie' }
        ]
      },
      { path: 'archivedBy', select: 'nom' }
    ]),
    getArchivages
  )
  .post(createArchivage);

router.route('/signalements').get(getArchivedSignalements);
router.route('/stats').get(getArchivageStats);

router
  .route('/:id')
  .get(getArchivage)
  .put(updateArchivage)
  .delete(deleteArchivage);

module.exports = router;