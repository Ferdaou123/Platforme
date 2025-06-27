import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';
import { getUsers, createUser, updateUser, deleteUser } from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import { toast } from 'react-toastify';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    rôle: 'citoyen'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    rôle: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchUsers = async (page = 1, limit = 10, search = '', role = '') => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit,
        select: 'nom,email,rôle,createdAt'
      };

      if (search) {
        params.search = search;
      }

      if (role) {
        params.rôle = role;
      }

      const res = await getUsers(params);
      
      setUsers(res.data.data);
      setPagination({
        page: res.data.pagination.page,
        limit: res.data.pagination.limit,
        total: res.data.pagination.total,
        pages: res.data.pagination.pages
      });
      
      setIsLoading(false);
    } catch (err) {
      toast.error('Erreur lors du chargement des utilisateurs');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, pagination.limit, filters.search, filters.rôle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    fetchUsers(1, pagination.limit, filters.search, filters.rôle);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      rôle: ''
    });
    fetchUsers(1, pagination.limit, '', '');
  };

  const handleAddUser = () => {
    setFormData({
      nom: '',
      email: '',
      mot_de_passe: '',
      rôle: 'citoyen'
    });
    setEditMode(false);
    setCurrentUserId(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      nom: user.nom,
      email: user.email,
      mot_de_passe: '',
      rôle: user.rôle
    });
    setEditMode(true);
    setCurrentUserId(user._id);
    setShowModal(true);
  };

  const handleDeleteUser = async (id, userName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      try {
        await deleteUser(id);
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers(pagination.page, pagination.limit, filters.search, filters.rôle);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email || (!editMode && !formData.mot_de_passe)) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!editMode && formData.mot_de_passe.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editMode) {
        const updateData = {
          nom: formData.nom,
          email: formData.email,
          rôle: formData.rôle
        };
        
        await updateUser(currentUserId, updateData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await createUser(formData);
        toast.success('Utilisateur créé avec succès');
      }
      
      setShowModal(false);
      fetchUsers(pagination.page, pagination.limit, filters.search, filters.rôle);
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage, pagination.limit, filters.search, filters.rôle);
  };

  if (isLoading && users.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} au total
          </p>
        </div>
        
        <button
          onClick={handleAddUser}
          className="btn btn-primary flex items-center"
        >
          <FaUserPlus className="mr-2" /> Ajouter un utilisateur
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
          >
            <FaFilter className="mr-2" /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          
          <div className="text-gray-500">
            Page {pagination.page} sur {pagination.pages}
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
                  placeholder="Rechercher par nom ou email..."
                  className="input pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="rôle" className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                id="rôle"
                name="rôle"
                value={filters.rôle}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Administrateur</option>
                <option value="citoyen">Citoyen</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="btn btn-primary mr-2"
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : 'Rechercher'}
              </button>
              <button
                onClick={resetFilters}
                className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.rôle === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.rôle === 'admin' ? 'Administrateur' : 'Citoyen'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.nom)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {isLoading ? 'Chargement...' : 'Aucun utilisateur trouvé'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}à{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}sur{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editMode ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="input"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {!editMode && '*'}
                </label>
                <input
                  type="password"
                  id="mot_de_passe"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleInputChange}
                  className="input"
                  required={!editMode}
                  disabled={isSubmitting}
                  placeholder={editMode ? 'Laisser vide pour conserver le mot de passe actuel' : 'Minimum 6 caractères'}
                  minLength={!editMode ? 6 : 0}
                />
                {editMode && (
                  <p className="mt-1 text-xs text-gray-500">
                    Note: La modification du mot de passe n'est pas possible via cette interface pour des raisons de sécurité.
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="rôle" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  id="rôle"
                  name="rôle"
                  value={formData.rôle}
                  onChange={handleInputChange}
                  className="input"
                  required
                  disabled={isSubmitting}
                >
                  <option value="citoyen">Citoyen</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {editMode ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    editMode ? 'Mettre à jour' : 'Créer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GestionUtilisateurs = () => {
  return (
    <Routes>
      <Route path="/" element={<UsersList />} />
    </Routes>
  );
};

export default GestionUtilisateurs;