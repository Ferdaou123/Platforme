const express = require('express');
const {
  getCategories,
  getCategorie,
  createCategorie,
  updateCategorie,
  deleteCategorie
} = require('../controllers/categories');

const Categorie = require('../models/Categorie');
const advancedResults = require('../middlewares/advancedResults');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router
  .route('/')
  .get(advancedResults(Categorie), getCategories)
  .post(protect, authorize('admin'), createCategorie);

router
  .route('/:id')
  .get(getCategorie)
  .put(protect, authorize('admin'), updateCategorie)
  .delete(protect, authorize('admin'), deleteCategorie);

module.exports = router;