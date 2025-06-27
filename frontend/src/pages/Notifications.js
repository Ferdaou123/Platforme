import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBell, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaTrash, 
  FaEye,
  FaFilter,
  FaUserPlus,
  FaThumbsUp,
  FaCog,
  FaArchive,
  FaComment,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import api from '../utils/api';
import Spinner from '../components/layout/Spinner';

moment.locale('fr');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    lu: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({ total: 0, totalNonLues: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.lu !== '') queryParams.append('lu', filters.lu);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const res = await api.get(`/notifications?${queryParams}`);
      
      if (res.data.pagination) {
        setNotifications(res.data.data);
        setPagination(res.data.pagination);
        setStats({ 
          total: res.data.total || res.data.count, 
          totalNonLues: res.data.nonLues || 0 
        });
      } else {
        setNotifications(res.data.data);
        const unreadCount = res.data.data.filter(n => !n.lu).length;
        setStats({ 
          total: res.data.count || res.data.data.length, 
          totalNonLues: unreadCount 
        });
        setPagination({ currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false });
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      setIsLoading(false);
    }
  }, [filters.type, filters.lu, filters.page, filters.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      
      setNotifications(notifications.map(notification => 
        notification._id === id 
          ? { ...notification, lu: true } 
          : notification
      ));
      
      setStats(prev => ({
        ...prev,
        totalNonLues: Math.max(0, prev.totalNonLues - 1)
      }));
      
      setSuccess('Notification marquée comme lue');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        lu: true
      })));
      
      setStats(prev => ({ ...prev, totalNonLues: 0 }));
      
      setSuccess('Toutes les notifications ont été marquées comme lues');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour des notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      
      const deletedNotification = notifications.find(n => n._id === id);
      setNotifications(notifications.filter(notification => notification._id !== id));
      
      if (deletedNotification && !deletedNotification.lu) {
        setStats(prev => ({
          ...prev,
          totalNonLues: Math.max(0, prev.totalNonLues - 1),
          total: prev.total - 1
        }));
      } else {
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
      }
      
      setSuccess('Notification supprimée');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression de la notification');
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      creation_compte: <FaUserPlus className="text-blue-500" />,
      nouveau_signalement: <FaExclamationCircle className="text-orange-500" />,
      vote_recu: <FaThumbsUp className="text-green-500" />,
      statut_modifie: <FaCog className="text-purple-500" />,
      signalement_resolu: <FaCheckCircle className="text-green-500" />,
      commentaire_ajoute: <FaComment className="text-blue-500" />,
      signalement_archive: <FaArchive className="text-gray-500" />,
      statut: <FaCheckCircle className="text-green-500" />,
      système: <FaExclamationCircle className="text-red-500" />,
      info: <FaInfoCircle className="text-blue-500" />,
      réponse: <FaComment className="text-blue-500" />
    };
    
    return iconMap[type] || <FaInfoCircle className="text-blue-500" />;
  };

  const getNotificationTypeLabel = (type) => {
    const labelMap = {
      creation_compte: 'Nouveau compte',
      nouveau_signalement: 'Nouveau signalement',
      vote_recu: 'Vote reçu',
      statut_modifie: 'Statut modifié',
      signalement_resolu: 'Signalement résolu',
      commentaire_ajoute: 'Commentaire ajouté',
      signalement_archive: 'Signalement archivé',
      statut: 'Mise à jour de statut',
      système: 'Notification système',
      info: 'Information',
      réponse: 'Réponse'
    };
    
    return labelMap[type] || type;
  };

  const getPriorityClass = (priorite) => {
    switch (priorite) {
      case 'haute':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'normale':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'basse':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && notifications.length === 0) {
    return <Spinner />;
  }

  const unreadCount = stats.totalNonLues !== undefined 
    ? stats.totalNonLues 
    : notifications.filter(notification => !notification.lu).length;

  const totalCount = stats.total !== undefined 
    ? stats.total 
    : notifications.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <FaBell className="mr-3 text-primary-600" />
              Notifications
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total : {totalCount}</span>
              <span className="text-orange-600 font-medium">
                Non lues : {unreadCount}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
            >
              <FaFilter className="mr-2" /> Filtres
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-primary"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-6 flex items-center">
            <FaCheck className="mr-2" />
            {success}
          </div>
        )}

        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de notification
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input"
                >
                  <option value="">Tous les types</option>
                  <option value="creation_compte">Nouveau compte</option>
                  <option value="nouveau_signalement">Nouveau signalement</option>
                  <option value="vote_recu">Vote reçu</option>
                  <option value="statut_modifie">Statut modifié</option>
                  <option value="signalement_resolu">Signalement résolu</option>
                  <option value="commentaire_ajoute">Commentaire ajouté</option>
                  <option value="signalement_archive">Signalement archivé</option>
                  <option value="statut">Mise à jour statut</option>
                  <option value="système">Système</option>
                  <option value="info">Information</option>
                  <option value="réponse">Réponse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut de lecture
                </label>
                <select
                  value={filters.lu}
                  onChange={(e) => handleFilterChange('lu', e.target.value)}
                  className="input"
                >
                  <option value="">Toutes</option>
                  <option value="false">Non lues</option>
                  <option value="true">Lues</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilters({ type: '', lu: '', page: 1, limit: 20 });
                }}
                className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  !notification.lu ? 'ring-2 ring-blue-200' : ''
                } ${notification.priorite ? getPriorityClass(notification.priorite) : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-grow">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {notification.titre && (
                            <h3 className="text-sm font-semibold text-gray-900">
                              {notification.titre}
                            </h3>
                          )}
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                          {!notification.lu && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2 break-words">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{moment(notification.dateCréation).fromNow()}</span>
                          <span>{moment(notification.dateCréation).format('DD/MM/YYYY à HH:mm')}</span>
                          {notification.signalement && (
                            <Link 
                              to={`/signalements/${notification.signalement._id || notification.signalement}`}
                              className="text-primary-600 hover:underline flex items-center"
                            >
                              <FaEye className="mr-1" />
                              Voir le signalement
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.lu && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Marquer comme lu"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FaBell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Pas de notifications
              </h3>
              <p className="text-gray-500">
                {filters.type || filters.lu !== '' 
                  ? 'Aucune notification ne correspond à vos filtres.'
                  : 'Vous n\'avez actuellement aucune notification.'
                }
              </p>
            </div>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="mr-1" />
                Précédent
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <FaChevronRight className="ml-1" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;