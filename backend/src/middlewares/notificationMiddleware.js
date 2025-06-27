const NotificationService = require('../utils/notificationService');

class NotificationMiddleware {
  
  static async nouveauUtilisateur(req, res, next) {
    if (req.user && req.method === 'POST' && req.originalUrl.includes('/auth/register')) {
      try {
        setTimeout(async () => {
          await NotificationService.notifierCreationCompte(req.user);
        }, 1000);
      } catch (error) {
        console.error('Erreur notification nouveau utilisateur:', error);
      }
    }
    next();
  }

  static async changementStatutSignalement(req, res, next) {
    if (req.method === 'PUT' && req.originalUrl.includes('/signalements/') && req.body.statut) {
      try {
        const signalementId = req.params.id;
        const Signalement = require('../models/Signalement');
        
        const signalement = await Signalement.findById(signalementId);
        if (signalement) {
          req.ancienStatut = signalement.statut;
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'ancien statut:', error);
      }
    }
    next();
  }

  static async postTraitement(req, res, next) {
    const originalSend = res.send;
    
    res.send = function(body) {
      setImmediate(async () => {
        try {
          if (req.method === 'POST' && 
              req.originalUrl.includes('/signalements') && 
              !req.originalUrl.includes('/vote') &&
              res.statusCode === 201) {
            
            const responseData = JSON.parse(body);
            if (responseData.success && responseData.data) {
              await NotificationService.notifierNouveauSignalement(
                responseData.data, 
                req.user
              );
            }
          }

          if (req.method === 'PUT' && 
              req.originalUrl.includes('/signalements/') && 
              req.body.statut && 
              req.ancienStatut &&
              res.statusCode === 200) {
            
            const responseData = JSON.parse(body);
            if (responseData.success && responseData.data && req.ancienStatut !== req.body.statut) {
              await NotificationService.notifierChangementStatut(
                responseData.data,
                req.ancienStatut,
                req.body.statut,
                req.user
              );
            }
          }

          if (req.method === 'POST' && 
              req.originalUrl.includes('/vote') && 
              res.statusCode === 200) {
            
            const signalementId = req.params.id;
            const Signalement = require('../models/Signalement');
            const signalement = await Signalement.findById(signalementId).populate('utilisateur');
            
            if (signalement && signalement.utilisateur._id.toString() !== req.user.id) {
              await NotificationService.notifierVoteRecu(signalement, req.user);
            }
          }

        } catch (error) {
          console.error('Erreur dans le post-traitement des notifications:', error);
        }
      });

      originalSend.call(this, body);
    };

    next();
  }

  static async nettoyageAutomatique() {
    try {
      await NotificationService.supprimerAnciennesNotifications(30);
    } catch (error) {
      console.error('Erreur lors du nettoyage automatique:', error);
    }
  }

  static async notificationSysteme(message, titre = 'Notification système') {
    try {
      const Utilisateur = require('../models/Utilisateur');
      const utilisateurs = await Utilisateur.find({ rôle: { $in: ['admin', 'technicien'] } });
      
      const notifications = await Promise.all(
        utilisateurs.map(user => 
          NotificationService.creerNotification({
            utilisateurId: user._id,
            type: 'systeme',
            titre,
            message,
            priorite: 'haute'
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification système:', error);
      throw error;
    }
  }
}

module.exports = NotificationMiddleware;