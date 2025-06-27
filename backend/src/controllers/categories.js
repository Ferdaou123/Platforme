const Categorie = require('../models/Categorie');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Categorie.find();
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.getCategorie = async (req, res, next) => {
  try {
    const categorie = await Categorie.findById(req.params.id);

    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: `Catégorie non trouvée avec l'id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.createCategorie = async (req, res, next) => {
  try {
    const categorie = await Categorie.create(req.body);

    res.status(201).json({
      success: true,
      data: categorie
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateCategorie = async (req, res, next) => {
  try {
    let categorie = await Categorie.findById(req.params.id);

    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: `Catégorie non trouvée avec l'id ${req.params.id}`
      });
    }

    categorie = await Categorie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.deleteCategorie = async (req, res, next) => {
  try {
    const categorie = await Categorie.findById(req.params.id);

    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: `Catégorie non trouvée avec l'id ${req.params.id}`
      });
    }

    await categorie.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};