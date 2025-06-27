import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';

export const useNotifications = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Récupérer le nombre de notifications non lues
  const fetchNotificationCount = async () => {
    if (!user) return;
    
    try {
      const res = await api.get('/notifications/unread-count');
      setNotificationCount(res.data.data.count);
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications:', error);
    }
  };

  // Récupérer les notifications récentes
  const fetchRecentNotifications = async (limit = 5) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const res = await api.get(`/notifications?limit=${limit}&lu=false`);
      setNotifications(res.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, lu: true }
            : notif
        )
      );
      
      // Décrémenter le compteur
      setNotificationCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      return false;
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(notif => ({ ...notif, lu: true })));
      setNotificationCount(0);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage global comme lu:', error);
      return false;
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // Mettre à jour l'état local
      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Décrémenter le compteur si la notification n'était pas lue
      if (deletedNotif && !deletedNotif.lu) {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }
  };

  // Effet pour charger les données au montage et périodiquement
  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      fetchRecentNotifications();

      // Actualiser toutes les 30 secondes
      const interval = setInterval(() => {
        fetchNotificationCount();
        fetchRecentNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Réinitialiser quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      setNotifications([]);
    }
  }, [user]);

  return {
    notificationCount,
    notifications,
    isLoading,
    fetchNotificationCount,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // Fonction utilitaire pour mettre à jour le compteur manuellement
    updateCount: setNotificationCount
  };
};

export default useNotifications;