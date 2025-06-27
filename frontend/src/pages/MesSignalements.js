import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import SignalementItem from '../components/signalements/SignalementItem';
import Spinner from '../components/layout/Spinner';
import api from '../utils/api';

const MesSignalements = () => {
  const [signalements, setSignalements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('tous');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchSignalements = async () => {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        try {
          const res = await api.get('/signalements/user');
          setSignalements(res.data.data || []);
        } catch (userRouteError) {
          const res = await api.get('/signalements');
          const allSignalements = res.data.data || [];
          
          if (!Array.isArray(allSignalements)) {
            throw new Error('Format de données invalide reçu du serveur');
          }
          
          const userSignalements = allSignalements.filter(signalement => {
            if (!signalement) return false;
            
            const signalementUserId = signalement.utilisateur?._id || signalement.utilisateur;
            const currentUserId = user._id || user.id;
            
            if (!signalementUserId || !currentUserId) return false;
            
            return signalementUserId.toString() === currentUserId.toString();
          });
          
          setSignalements(userSignalements);
        }
        
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Erreur inconnue';
        setError(`Erreur lors du chargement des signalements: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    fetchSignalements();
  }, [user]);

  const filteredSignalements = signalements.filter(signalement => {
    if (!signalement) return false;
    
    const titre = signalement.titre || '';
    const description = signalement.description || '';
    const searchLower = search.toLowerCase();
    
    const matchSearch = search === '' || 
      titre.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower);
    
    const matchStatus = filter === 'tous' || signalement.statut === filter;
    
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Mes signalements
        </h1>
        <Link to="/nouveau-signalement" className="btn btn-primary flex items-center justify-center md:w-auto">
          <FaPlus className="mr-2" /> Nouveau signalement
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">Erreur de chargement</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="ml-4 text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded"
            >
              Recharger
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher dans vos signalements..."
                className="input pl-10"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
            >
              <option value="tous">Tous les statuts</option>
              <option value="attente">En attente</option>
              <option value="cours">En cours</option>
              <option value="résolu">Résolu</option>
            </select>
          </div>
        </div>
        
        {(search || filter !== 'tous') && (
          <div className="mt-4 text-sm text-gray-600">
            {filteredSignalements.length} résultat{filteredSignalements.length > 1 ? 's' : ''} 
            {search && ` pour "${search}"`}
            {filter !== 'tous' && ` avec le statut "${filter}"`}
          </div>
        )}
      </div>
      
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
            <div className="max-w-md mx-auto">
              {signalements.length === 0 ? (
                <>
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FaPlus className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-500 mb-2">
                      Vous n'avez pas encore créé de signalements
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Commencez par signaler un problème dans votre quartier pour améliorer votre ville.
                    </p>
                  </div>
                  <Link to="/nouveau-signalement" className="btn btn-primary">
                    <FaPlus className="mr-2 inline" /> Créer votre premier signalement
                  </Link>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FaSearch className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-500 mb-2">
                      Aucun signalement trouvé
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Aucun de vos {signalements.length} signalement{signalements.length > 1 ? 's' : ''} ne correspond à vos critères de recherche.
                    </p>
                  </div>
                  <div className="space-x-4">
                    <button
                      onClick={() => {
                        setSearch('');
                        setFilter('tous');
                      }}
                      className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      Réinitialiser les filtres
                    </button>
                    <Link to="/nouveau-signalement" className="btn btn-primary">
                      <FaPlus className="mr-2 inline" /> Nouveau signalement
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {signalements.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          {filteredSignalements.length} signalement{filteredSignalements.length > 1 ? 's' : ''} affiché{filteredSignalements.length > 1 ? 's' : ''} 
          sur {signalements.length} au total
        </div>
      )}
    </div>
  );
};

export default MesSignalements;