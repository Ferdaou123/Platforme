const express = require('express');
const {
  getCommentaires,
  getCommentaire,
  addCommentaire,
  updateCommentaire,
  deleteCommentaire,
  getUserCommentaires,
  moderateCommentaire,
  getAllCommentaires
} = require('../controllers/commentaires');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.route('/admin/all').get(protect, authorize('admin'), getAllCommentaires);
router.route('/user/:userId').get(protect, getUserCommentaires);

router
  .route('/')
  .get(getCommentaires)
  .post(protect, addCommentaire);

router.route('/:id/moderate').put(protect, authorize('admin'), moderateCommentaire);

router
  .route('/:id')
  .get(getCommentaire)
  .put(protect, updateCommentaire)
  .delete(protect, deleteCommentaire);

module.exports = router;