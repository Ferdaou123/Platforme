const express = require('express');
const router = express.Router({ mergeParams: true });
const Vote = require('../models/Vote');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

// @desc    Obtenir tous les votes pour un signalement
// @route   GET /api/v1/signalements/:signalementId/votes
// @access  Public
router.get('/', advancedResults(Vote, {
  path: 'utilisateur',
  select: 'nom'
}), async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Vérifier si un utilisateur a voté pour un signalement
// @route   GET /api/v1/signalements/:signalementId/votes/check
// @access  Private
router.get('/check', protect, async (req, res) => {
  const vote = await Vote.findOne({
    signalement: req.params.signalementId,
    utilisateur: req.user.id
  });

  res.status(200).json({
    success: true,
    hasVoted: !!vote
  });
});

module.exports = router;