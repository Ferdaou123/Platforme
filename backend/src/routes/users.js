const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

const Utilisateur = require('../models/Utilisateur');
const advancedResults = require('../middlewares/advancedResults');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// Toutes les routes nécessitent d'être admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(
    advancedResults(Utilisateur, [], 'nom email rôle createdAt'),
    getUsers
  )
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;