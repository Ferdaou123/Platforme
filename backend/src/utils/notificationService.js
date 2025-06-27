const Notification = require('../models/Notification');
const Utilisateur = require('../models/Utilisateur');

class NotificationService {
  
  static async creerNotification({
    utilisateurId,
    type,
    titre,
    message,
    signalement = null,
    priorite = 'normale',
    donneesSupplement = {}
  }) {
    try {
      const notification = await Notification.create({
        utilisateur: utilisateurId,
        type,
        titre,
        message,
        signalement,
        priorite,
        donneesSupplement
      });

      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  static async notifierAdmins({ type, titre, message, signalement = null, donneesSupplement = {} }) {
    try {
      const admins = await Utilisateur.find({ rôle: 'admin' });
      
      const notifications = await Promise.all(
        admins.map(admin => 
          this.creerNotification({
            utilisateurId: admin._id,
            type,
            titre,
            message,
            signalement,
            priorite: 'haute',
            donneesSupplement
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la notification des admins:', error);
      throw error;
    }
  }

  static async notifierCreationCompte(nouvelUtilisateur) {
    return await this.notifierAdmins({
      type: 'creation_compte',
      titre: 'Nouveau compte créé',
      message: `Un nouveau ${nouvelUtilisateur.rôle} s'est inscrit : ${nouvelUtilisateur.nom} (${nouvelUtilisateur.email})`,
      donneesSupplement: {
        nom_utilisateur: nouvelUtilisateur.nom,
        role_utilisateur: nouvelUtilisateur.rôle
      }
    });
  }

  static async notifierNouveauSignalement(signalement, utilisateur) {
    return await this.notifierAdmins({
      type: 'nouveau_signalement',
      titre: 'Nouveau signalement créé',
      message: `${utilisateur.nom} a créé un nouveau signalement : "${signalement.titre}"`,
      signalement: signalement._id,
      donneesSupplement: {
        nom_utilisateur: utilisateur.nom,
        titre_signalement: signalement.titre,
        categorie: signalement.catégorie?.nomCategorie
      }
    });
  }

  static async notifierVoteRecu(signalement, votant) {
    return await this.creerNotification({
      utilisateurId: signalement.utilisateur,
      type: 'vote_recu',
      titre: 'Nouveau vote reçu',
      message: `${votant.nom} a voté pour votre signalement "${signalement.titre}". Total des votes : ${signalement.compteurVotes + 1}`,
      signalement: signalement._id,
      priorite: 'normale',
      donneesSupplement: {
        nom_utilisateur: votant.nom,
        titre_signalement: signalement.titre,
        nombre_votes: signalement.compteurVotes + 1
      }
    });
  }

  static async notifierChangementStatut(signalement, ancienStatut, nouveauStatut, modifiePar) {
    const messages = {
      'attente': 'en attente de traitement',
      'cours': 'en cours de traitement',
      'résolu': 'résolu'
    };

    await this.creerNotification({
      utilisateurId: signalement.utilisateur._id || signalement.utilisateur,
      type: 'statut_modifie',
      titre: 'Statut de votre signalement modifié',
      message: `Le statut de votre signalement "${signalement.titre}" est passé de "${messages[ancienStatut]}" à "${messages[nouveauStatut]}"`,
      signalement: signalement._id,
      priorite: nouveauStatut === 'résolu' ? 'haute' : 'normale',
      donneesSupplement: {
        ancien_statut: ancienStatut,
        nouveau_statut: nouveauStatut,
        titre_signalement: signalement.titre,
        modifie_par: modifiePar.nom
      }
    });

    if (nouveauStatut === 'résolu') {
      await this.notifierSignalementResolu(signalement);
    }
  }

  static async notifierSignalementResolu(signalement) {
    try {
      const Vote = require('../models/Vote');
      const votes = await Vote.find({ signalement: signalement._id }).populate('utilisateur');
      
      const notifications = await Promise.all(
        votes.map(vote => 
          this.creerNotification({
            utilisateurId: vote.utilisateur._id,
            type: 'signalement_resolu',
            titre: 'Signalement résolu',
            message: `Le signalement "${signalement.titre}" que vous avez soutenu a été résolu !`,
            signalement: signalement._id,
            priorite: 'normale',
            donneesSupplement: {
              titre_signalement: signalement.titre
            }
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la notification de résolution:', error);
    }
  }

  static async notifierArchivage(signalement, archivedBy) {
    return await this.creerNotification({
      utilisateurId: signalement.utilisateur._id || signalement.utilisateur,
      type: 'signalement_archive',
      titre: 'Signalement archivé',
      message: `Votre signalement "${signalement.titre}" a été archivé par ${archivedBy.nom}`,
      signalement: signalement._id,
      priorite: 'normale',
      donneesSupplement: {
        titre_signalement: signalement.titre,
        archive_par: archivedBy.nom
      }
    });
  }

  static async marquerCommeLu(notificationId, utilisateurId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, utilisateur: utilisateurId },
      { lu: true },
      { new: true }
    );
  }

  static async marquerToutesCommeLues(utilisateurId) {
    return await Notification.updateMany(
      { utilisateur: utilisateurId, lu: false },
      { lu: true }
    );
  }

  static async compterNonLues(utilisateurId) {
    return await Notification.countDocuments({
      utilisateur: utilisateurId,
      lu: false
    });
  }

  static async getNotificationsUtilisateur(utilisateurId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return await Notification.find({ utilisateur: utilisateurId })
      .populate('signalement', 'titre')
      .sort({ dateCréation: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async supprimerAnciennesNotifications(joursAnciennete = 30) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - joursAnciennete);
    
    const result = await Notification.deleteMany({
      dateCréation: { $lt: dateLimit },
      lu: true
    });

    return result;
  }
}

module.exports = NotificationService;