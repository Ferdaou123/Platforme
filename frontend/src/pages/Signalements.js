import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaFilter, FaPlus, FaMapMarkedAlt, FaList, FaSearch } from 'react-icons/fa';
import SignalementItem from '../components/signalements/SignalementItem';
import MapComponent from '../components/map/MapComponent';
import Spinner from '../components/layout/Spinner';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';

const Signalements = () => {
  const [signalements, setSignalements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    statut: '',
    categorie: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const signalRes = await api.get('/signalements');
        const categoriesRes = await api.get('/categories');

        setSignalements(signalRes.data.data);
        setCategories(categoriesRes.data.data);
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSignalements = signalements.filter(signalement => {
    if (!signalement || !signalement._id) return false;

    if (filters.statut && signalement.statut !== filters.statut) {
      return false;
    }

    if (filters.categorie && (!signalement.catégorie || signalement.catégorie._id !== filters.categorie)) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        signalement.titre?.toLowerCase().includes(searchLower) ||
        signalement.description?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      statut: '',
      categorie: '',
      search: ''
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Liste des signalements
          </h1>
          <p className="text-gray-600">
            {filteredSignalements.length} signalements trouvés
          </p>
        </div>

        <div className="flex flex-wrap mt-4 md:mt-0 gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
          >
            <FaFilter className="mr-2" /> Filtres
          </button>

          <div className="bg-gray-100 rounded-md overflow-hidden flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-700'}`}
            >
              <FaList className="mr-1" /> Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 flex items-center ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-700'}`}
            >
              <FaMapMarkedAlt className="mr-1" /> Carte
            </button>
          </div>

          {user && (
            <Link to="/nouveau-signalement" className="btn btn-primary flex items-center">
              <FaPlus className="mr-2" /> Nouveau signalement
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="Rechercher un signalement..."
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
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="categorie"
                name="categorie"
                value={filters.categorie}
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
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSignalements.length > 0 ? (
            filteredSignalements.map(signalement => (
              <SignalementItem
                key={signalement._id}
                signalement={signalement}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium text-gray-500">Aucun signalement trouvé</h3>
              <p className="mt-2 text-gray-500">Modifiez vos filtres ou créez un nouveau signalement</p>
              {user && (
                <Link to="/nouveau-signalement" className="btn btn-primary mt-4 inline-block">
                  <FaPlus className="mr-2 inline" /> Nouveau signalement
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="h-[700px] rounded-lg overflow-hidden shadow-md">
          <MapComponent signalements={filteredSignalements} height="100%" />
        </div>
      )}
    </div>
  );
};

export default Signalements;