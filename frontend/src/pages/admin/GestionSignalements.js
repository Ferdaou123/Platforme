import React, { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { FaFilter, FaEye, FaEdit, FaTrash, FaCheckCircle, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import { toast } from 'react-toastify';

const SignalementsList = () => {
  const [signalements, setSignalements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    catégorie: '',
    service: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const signalRes = await api.get('/signalements');
        const categoriesRes = await api.get('/categories');
        const servicesRes = await api.get('/services');
        
        const validSignalements = signalRes.data.data.filter(
          signalement => signalement && signalement.catégorie
        );
        
        setSignalements(validSignalements);
        setCategories(categoriesRes.data.data);
        setServices(servicesRes.data.data);
        setIsLoading(false);
      } catch (err) {
        toast.error('Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      statut: '',
      catégorie: '',
      service: '',
      search: ''
    });
  };

  const handleChangeStatut = async (id, statut) => {
    try {
      await api.put(`/signalements/${id}`, { statut });
      setSignalements(signalements.map(signalement => 
        signalement._id === id 
          ? { ...signalement, statut } 
          : signalement
      ));
      toast.success('Statut mis à jour avec succès');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteSignalement = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      try {
        await api.delete(`/signalements/${id}`);
        setSignalements(signalements.filter(signalement => signalement._id !== id));
        toast.success('Signalement supprimé avec succès');
      } catch (err) {
        toast.error('Erreur lors de la suppression du signalement');
      }
    }
  };

  const handleArchiveSignalement = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir archiver ce signalement ?')) {
      try {
        await api.post('/archivages', {
          signalement: id,
          raison: 'Archivé par un administrateur'
        });
        setSignalements(signalements.filter(signalement => signalement._id !== id));
        toast.success('Signalement archivé avec succès');
      } catch (err) {
        toast.error('Erreur lors de l\'archivage du signalement');
      }
    }
  };

  const filteredSignalements = signalements.filter(signalement => {
    if (filters.statut && signalement.statut !== filters.statut) {
      return false;
    }
    
    if (filters.catégorie && (!signalement.catégorie || signalement.catégorie._id !== filters.catégorie)) {
      return false;
    }
    
    if (filters.service && (!signalement.service || signalement.service._id !== filters.service)) {
      return false;
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        signalement.titre.toLowerCase().includes(searchTerm) ||
        signalement.description.toLowerCase().includes(searchTerm) ||
        (signalement.position && signalement.position.adresse && 
         signalement.position.adresse.toLowerCase().includes(searchTerm))
      );
    }
    
    return true;
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des signalements</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
          >
            <FaFilter className="mr-2" /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          
          <div className="text-gray-500">
            {filteredSignalements.length} signalement(s) trouvé(s)
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                  placeholder="Rechercher..."
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
                <option value="attente">En attente</option>
                <option value="cours">En cours</option>
                <option value="résolu">Résolu</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="catégorie" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="catégorie"
                name="catégorie"
                value={filters.catégorie}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.nomCategorie}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select
                id="service"
                name="service"
                value={filters.service}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">Tous les services</option>
                {services.map(service => (
                  <option key={service._id} value={service._id}>
                    {service.nomService}
                  </option>
                ))}
              </select>
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
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
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
            {filteredSignalements.length > 0 ? (
                filteredSignalements.map(signalement => (
                  <tr key={signalement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {signalement.titre || 'Sans titre'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {signalement.description ? signalement.description.substring(0, 50) + '...' : 'Pas de description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {signalement.catégorie?.nomCategorie || 'Catégorie non définie'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {signalement.dateCréation ? new Date(signalement.dateCréation).toLocaleDateString() : 'Date inconnue'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {signalement.compteurVotes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <select
                          value={signalement.statut || 'attente'}
                          onChange={(e) => handleChangeStatut(signalement._id, e.target.value)}
                          className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="attente">En attente</option>
                          <option value="cours">En cours</option>
                          <option value="résolu">Résolu</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/signalements/${signalement._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/signalements/${signalement._id}/edit`}
                          className="text-green-600 hover:text-green-900"
                          title="Modifier"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleArchiveSignalement(signalement._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Archiver"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => handleDeleteSignalement(signalement._id)}
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
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun signalement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GestionSignalements = () => {
  return (
    <Routes>
      <Route path="/" element={<SignalementsList />} />
    </Routes>
  );
};

export default GestionSignalements;