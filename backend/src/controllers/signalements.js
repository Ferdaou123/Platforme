const path = require('path');
const Signalement = require('../models/Signalement');
const Notification = require('../models/Notification');
const Vote = require('../models/Vote');
const fs = require('fs');

let NotificationService;
try {
  NotificationService = require('../utils/notificationService');
} catch (error) {
  NotificationService = null;
}

const envoyerNotification = async (type, donnees) => {
  setImmediate(async () => {
    try {
      if (NotificationService && typeof NotificationService[type] === 'function') {
        await NotificationService[type](...donnees);
      } else {
        switch (type) {
          case 'notifierNouveauSignalement':
            const [signalement] = donnees;
            const Utilisateur = require('../models/Utilisateur');
            const admins = await Utilisateur.find({ rôle: 'admin' });
            await Notification.insertMany(admins.map(admin => ({
              message: `Nouveau signalement : "${signalement.titre}"`,
              utilisateur: admin._id,
              signalement: signalement._id,
              type: 'nouveau_signalement'
            })));
            break;
          case 'notifierChangementStatut':
            const [sig, ancienStatut, nouveauStatut] = donnees;
            await Notification.create({
              message: `Statut modifié : ${ancienStatut} → ${nouveauStatut}`,
              utilisateur: sig.utilisateur._id,
              signalement: sig._id,
              type: 'statut'
            });
            break;
          case 'notifierVoteRecu':
            const [sigVote] = donnees;
            await Notification.create({
              message: `Nouveau vote pour "${sigVote.titre}"`,
              utilisateur: sigVote.utilisateur._id,
              signalement: sigVote._id,
              type: 'vote_recu'
            });
            break;
        }
      }
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  });
};

exports.getSignalements = async (req, res, next) => {
  try {
    const signalements = await Signalement.find()
      .populate('utilisateur', 'nom')
      .populate('catégorie')
      .populate('service')
      .sort('-dateCréation');

    res.status(200).json({
      success: true,
      count: signalements.length,
      data: signalements
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

exports.getSignalementsStats = async (req, res, next) => {
  try {
    const totalSignalements = await Signalement.countDocuments();
    
    const statsByStatus = await Signalement.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    const statsByCategory = await Signalement.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'catégorie',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$catégorie',
          categoryName: { $first: '$categoryInfo.nomCategorie' },
          count: { $sum: 1 }
        }
      }
    ]);

    const resolvedCount = statsByStatus.find(item => item._id === 'résolu')?.count || 0;
    const resolutionRate = totalSignalements > 0 ? (resolvedCount / totalSignalements) * 100 : 0;

    res.status(200).json({
      success: true,
      data: { totalSignalements, statsByStatus, statsByCategory, resolutionRate }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

exports.getSignalement = async (req, res, next) => {
  try {
    if (req.params.id === 'stats') {
      return await exports.getSignalementsStats(req, res, next);
    }
    
    const signalement = await Signalement.findById(req.params.id)
      .populate('utilisateur', 'nom')
      .populate('catégorie')
      .populate('service');

    if (!signalement) {
      return res.status(404).json({ success: false, error: 'Signalement non trouvé' });
    }

    res.status(200).json({ success: true, data: signalement });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

exports.createSignalement = async (req, res, next) => {
  try {
    req.body.utilisateur = req.user.id;

    if (!req.body.position?.coordinates?.length || !req.body.catégorie) {
      return res.status(400).json({
        success: false,
        error: 'Position et catégorie requis'
      });
    }

    if (!['attente', 'cours', 'résolu'].includes(req.body.statut)) {
      req.body.statut = 'attente';
    }

    const signalement = await Signalement.create(req.body);
    
    const signalementComplet = await Signalement.findById(signalement._id)
      .populate('utilisateur', 'nom')
      .populate('catégorie', 'nomCategorie');
    
    await envoyerNotification('notifierNouveauSignalement', [signalementComplet]);

    res.status(201).json({ success: true, data: signalement });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Erreur création' });
  }
};

exports.updateSignalement = async (req, res, next) => {
  try {
    let signalement = await Signalement.findById(req.params.id).populate('utilisateur');

    if (!signalement) {
      return res.status(404).json({ success: false, error: 'Signalement non trouvé' });
    }

    if (signalement.utilisateur._id.toString() !== req.user.id && req.user.rôle !== 'admin') {
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }

    const ancienStatut = signalement.statut;
    
    signalement = await Signalement.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate(['utilisateur', 'catégorie']);

    if (req.body.statut && req.body.statut !== ancienStatut) {
      await envoyerNotification('notifierChangementStatut', [signalement, ancienStatut, req.body.statut, req.user]);
    }

    res.status(200).json({ success: true, data: signalement });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur mise à jour' });
  }
};

exports.deleteSignalement = async (req, res, next) => {
  try {
    const signalement = await Signalement.findById(req.params.id);

    if (!signalement) {
      return res.status(404).json({ success: false, error: 'Signalement non trouvé' });
    }

    if (signalement.utilisateur.toString() !== req.user.id && req.user.rôle !== 'admin') {
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }

    if (signalement.photoUrl && signalement.photoUrl !== 'no-photo.jpg') {
      const imagePath = path.join(__dirname, '../../uploads/images', signalement.photoUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Vote.deleteMany({ signalement: req.params.id });
    await Notification.deleteMany({ signalement: req.params.id });
    await signalement.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur suppression' });
  }
};

exports.signalementPhotoUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier' });
    }

    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) {
      return res.status(404).json({ success: false, error: 'Signalement non trouvé' });
    }

    if (signalement.utilisateur.toString() !== req.user.id && req.user.rôle !== 'admin') {
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }

    if (signalement.photoUrl && signalement.photoUrl !== 'no-photo.jpg') {
      const oldPath = path.join(__dirname, '../../uploads/images', signalement.photoUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await Signalement.findByIdAndUpdate(req.params.id, { photoUrl: req.file.filename });

    res.status(200).json({
      success: true,
      data: { fileName: req.file.filename, filePath: `/uploads/images/${req.file.filename}` }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur upload' });
  }
};

exports.getSignalementsInRadius = async (req, res, next) => {
  try {
    const { lat, lng, distance } = req.params;
    const radius = distance / 6378.1;

    const signalements = await Signalement.find({
      position: {
        $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius] }
      }
    }).populate(['utilisateur', 'catégorie']);

    res.status(200).json({ success: true, count: signalements.length, data: signalements });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

exports.voteSignalement = async (req, res, next) => {
  try {
    const signalement = await Signalement.findById(req.params.id).populate('utilisateur');

    if (!signalement) {
      return res.status(404).json({ success: false, error: 'Signalement non trouvé' });
    }

    const existingVote = await Vote.findOne({
      utilisateur: req.user.id,
      signalement: req.params.id
    });

    if (existingVote) {
      return res.status(400).json({ success: false, error: 'Déjà voté' });
    }

    const vote = await Vote.create({
      utilisateur: req.user.id,
      signalement: req.params.id
    });

    signalement.compteurVotes = (signalement.compteurVotes || 0) + 1;
    await signalement.save();

    if (signalement.utilisateur._id.toString() !== req.user.id) {
      await envoyerNotification('notifierVoteRecu', [signalement, req.user]);
    }

    res.status(201).json({
      success: true,
      data: vote,
      compteurVotes: signalement.compteurVotes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur vote' });
  }
};

exports.removeVote = async (req, res, next) => {
  try {
    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) {
      return res.status(404).json({ success: false, error: 'Signalement non trouvé' });
    }

    const vote = await Vote.findOne({
      utilisateur: req.user.id,
      signalement: req.params.id
    });
    

    if (!vote) {
      return res.status(400).json({ success: false, error: 'Pas de vote' });
    }

    await vote.deleteOne();
    signalement.compteurVotes = Math.max((signalement.compteurVotes || 0) - 1, 0);
    await signalement.save();

    res.status(200).json({
      success: true,
      data: {},
      compteurVotes: signalement.compteurVotes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

exports.checkUserVote = async (req, res, next) => {
  try {
    const vote = await Vote.findOne({
      utilisateur: req.user.id,
      signalement: req.params.id
    });

    res.status(200).json({ success: true, hasVoted: !!vote });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};