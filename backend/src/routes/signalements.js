const express = require('express');
const {
  getSignalements,
  getSignalement,
  createSignalement,
  updateSignalement,
  deleteSignalement,
  signalementPhotoUpload,
  getSignalementsInRadius,
  voteSignalement,
  removeVote,
  getSignalementsStats
} = require('../controllers/signalements');
const Signalement = require('../models/Signalement');
const advancedResults = require('../middlewares/advancedResults');
const { protect } = require('../middlewares/auth');
const { upload } = require('../server');
const voteRouter = require('./votes');
const commentaireRouter = require('./commentaires');

const router = express.Router();

router.use('/:signalementId/votes', voteRouter);
router.use('/:signalementId/commentaires', commentaireRouter);

router.put('/:id/photo', protect, upload.single('file'), signalementPhotoUpload);

router.get('/stats', getSignalementsStats);
router.get('/rayon/:lat/:lng/:distance', getSignalementsInRadius);

router.post('/:id/vote', protect, voteSignalement);
router.delete('/:id/vote', protect, removeVote);

router
  .route('/:id')
  .get(getSignalement)
  .put(protect, updateSignalement)
  .delete(protect, deleteSignalement);

router
  .route('/')
  .get(
    advancedResults(Signalement, [
      { path: 'utilisateur', select: 'nom' },
      { path: 'catégorie', select: 'nomCategorie' },
      { path: 'service', select: 'nomService' }
    ]),
    getSignalements
  )
  .post(protect, createSignalement);

module.exports = router;