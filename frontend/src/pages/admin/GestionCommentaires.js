import React, { useState, useEffect, useCallback } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { FaFilter, FaEye, FaTrash, FaSearch, FaUser } from 'react-icons/fa';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const CommentairesList = () => {
  const [commentaires, setCommentaires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    signalement: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchCommentaires = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 20,
        ...filters
      };
      const res = await api.get('/commentaires/admin/all', { params });
      setCommentaires(res.data.data);
      setPagination(res.data.pagination || {});
      setIsLoading(false);
    } catch (err) {
      toast.error('Erreur lors du chargement des commentaires');
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchCommentaires();
  }, [fetchCommentaires]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      statut: '',
      signalement: ''
    });
    setPage(1);
  };

  const handleModerateComment = async (commentId, newStatut) => {
    try {
      await api.put(`/commentaires/${commentId}/moderate`, { statut: newStatut });
      setCommentaires(prev =>
        prev.map(comment =>
          comment._id === commentId
            ? { ...comment, statut: newStatut }
            : comment
        )
      );
      toast.success(`Commentaire ${newStatut === 'modéré' ? 'modéré' : newStatut} avec succès`);
    } catch (err) {
      toast.error('Erreur lors de la modération du commentaire');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await api.delete(`/commentaires/${commentId}`);
      setCommentaires(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Commentaire supprimé avec succès');
    } catch (err) {
      toast.error('Erreur lors de la suppression du commentaire');
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'modéré':
        return 'bg-yellow-100 text-yellow-800';
      case 'supprimé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && page === 1) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des commentaires</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
          >
            <FaFilter className="mr-2" /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          
          <div className="text-gray-500">
            {commentaires.length} commentaire(s) trouvé(s)
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Rechercher dans les commentaires..."
                  className="input pl-10"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="modéré">Modéré</option>
                <option value="supprimé">Supprimé</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="signalement" className="block text-sm font-medium text-gray-700 mb-1">
                ID Signalement
              </label>
              <input
                type="text"
                id="signalement"
                name="signalement"
                value={filters.signalement}
                onChange={handleFilterChange}
                placeholder="ID du signalement"
                className="input"
              />
            </div>
          </div>
        )}
        
        {showFilters && (
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commentaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signalement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commentaires.length > 0 ? (
                commentaires.map(commentaire => (
                  <tr key={commentaire._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <p className="truncate">
                          {commentaire.contenu ? commentaire.contenu.substring(0, 100) + '...' : 'Pas de contenu'}
                        </p>
                        {commentaire.commentaireParent && (
                          <p className="text-xs text-gray-500 mt-1">
                            Réponse à un commentaire
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {commentaire.utilisateur?.nom || 'Utilisateur inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {commentaire.utilisateur?.email || 'Email inconnu'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {commentaire.signalement?.titre ? (
                          <Link
                            to={`/signalements/${commentaire.signalement._id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {commentaire.signalement.titre.substring(0, 30)}...
                          </Link>
                        ) : (
                          'Signalement supprimé'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {commentaire.dateCréation ? moment(commentaire.dateCréation).format('DD/MM/YYYY HH:mm') : 'Date inconnue'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={commentaire.statut || 'actif'}
                        onChange={(e) => handleModerateComment(commentaire._id, e.target.value)}
                        className={`text-xs rounded-full px-2 py-1 font-medium ${getStatutColor(commentaire.statut)}`}
                      >
                        <option value="actif">Actif</option>
                        <option value="modéré">Modéré</option>
                        <option value="supprimé">Supprimé</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/signalements/${commentaire.signalement?._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir le signalement"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => handleDeleteComment(commentaire._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer définitivement"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun commentaire trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(pagination.prev || pagination.next) && (
        <div className="flex justify-center mt-6 space-x-2">
          {pagination.prev && (
            <button
              onClick={() => setPage(pagination.prev.page)}
              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Précédent
            </button>
          )}
          
          <span className="flex items-center px-4 py-2 text-gray-700">
            Page {page}
          </span>
          
          {pagination.next && (
            <button
              onClick={() => setPage(pagination.next.page)}
              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Suivant
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const GestionCommentaires = () => {
  return (
    <Routes>
      <Route path="/" element={<CommentairesList />} />
    </Routes>
  );
};

export default GestionCommentaires;