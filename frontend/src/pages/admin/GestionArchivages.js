import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  FaArchive, 
  FaUndo, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaChartBar,
  FaDownload
} from 'react-icons/fa';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const ArchivagesList = () => {
  const [archivages, setArchivages] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    mois: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArchivage, setSelectedArchivage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const archivagesRes = await api.get('/archivages/signalements');
      setArchivages(archivagesRes.data.data);
      const statsRes = await api.get('/archivages/stats');
      setStats(statsRes.data.data);
      setIsLoading(false);
    } catch (err) {
      toast.error('Erreur lors du chargement des archivages');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnarchive = async (archivageId, signalementTitre) => {
    if (window.confirm(`Êtes-vous sûr de vouloir désarchiver le signalement "${signalementTitre}" ?`)) {
      try {
        await api.delete(`/archivages/${archivageId}`);
        toast.success('Signalement désarchivé avec succès');
        fetchData();
      } catch (err) {
        toast.error('Erreur lors du désarchivage');
      }
    }
  };

  const handleViewDetails = (archivage) => {
    setSelectedArchivage(archivage);
    setShowModal(true);
  };

  const filteredArchivages = archivages.filter(archivage => {
    const signalement = archivage.signalement;
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchTitle = signalement.titre?.toLowerCase().includes(searchTerm);
      const matchDescription = signalement.description?.toLowerCase().includes(searchTerm);
      const matchUser = signalement.utilisateur?.nom?.toLowerCase().includes(searchTerm);
      const matchReason = archivage.raison?.toLowerCase().includes(searchTerm);
      
      if (!(matchTitle || matchDescription || matchUser || matchReason)) {
        return false;
      }
    }
    
    if (filters.statut && signalement.statut !== filters.statut) {
      return false;
    }
    
    if (filters.mois) {
      const archivageMois = moment(archivage.dateArchivage).format('YYYY-MM');
      if (archivageMois !== filters.mois) {
        return false;
      }
    }
    
    return true;
  });

  const handleExport = () => {
    const csvContent = [
      ['Titre', 'Statut', 'Catégorie', 'Utilisateur', 'Date Archivage', 'Archivé par', 'Raison'].join(','),
      ...filteredArchivages.map(archivage => [
        `"${archivage.signalement.titre}"`,
        archivage.signalement.statut,
        archivage.signalement.catégorie?.nomCategorie || '',
        archivage.signalement.utilisateur?.nom || '',
        moment(archivage.dateArchivage).format('DD/MM/YYYY'),
        archivage.archivedBy?.nom || '',
        `"${archivage.raison}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `archivages_${moment().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export CSV réussi');
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestion des Archives
          </h1>
          <p className="text-gray-600">
            {filteredArchivages.length} signalement{filteredArchivages.length > 1 ? 's' : ''} archivé{filteredArchivages.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
          >
            <FaDownload className="mr-2" /> Exporter CSV
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaArchive className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Archivé
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.totalArchivages}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartBar className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Résolus Archivés
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.archivagesParStatut?.résolu || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendarAlt className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ce Mois
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {stats.archivagesParMois?.[moment().format('YYYY-MM')] || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center"
          >
            <FaFilter className="mr-2" /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Titre, description, utilisateur..."
                  className="input pl-10"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({...filters, statut: e.target.value})}
                className="input"
              >
                <option value="">Tous les statuts</option>
                <option value="attente">En attente</option>
                <option value="cours">En cours</option>
                <option value="résolu">Résolu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mois d'archivage
              </label>
              <input
                type="month"
                value={filters.mois}
                onChange={(e) => setFilters({...filters, mois: e.target.value})}
                className="input"
              />
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
                  Signalement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'archivage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archivé par
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArchivages.length > 0 ? (
                filteredArchivages.map(archivage => (
                  <tr key={archivage._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {archivage.signalement.photoUrl && archivage.signalement.photoUrl !== 'no-photo.jpg' ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`http://localhost:5000/uploads/images/${archivage.signalement.photoUrl}`}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaArchive className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {archivage.signalement.titre}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FaTag className="mr-1" />
                            {archivage.signalement.catégorie?.nomCategorie}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        archivage.signalement.statut === 'résolu'
                          ? 'bg-green-100 text-green-800'
                          : archivage.signalement.statut === 'cours'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {archivage.signalement.statut === 'résolu' ? 'Résolu' :
                         archivage.signalement.statut === 'cours' ? 'En cours' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaUser className="mr-2 text-gray-400" />
                        {archivage.signalement.utilisateur?.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {moment(archivage.dateArchivage).format('DD/MM/YYYY à HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {archivage.archivedBy?.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(archivage)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleUnarchive(archivage._id, archivage.signalement.titre)}
                          className="text-green-600 hover:text-green-900"
                          title="Désarchiver"
                        >
                          <FaUndo />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun signalement archivé trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedArchivage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Détails de l'archivage
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Signalement</h3>
                <p className="text-xl font-medium">{selectedArchivage.signalement.titre}</p>
                <p className="text-gray-600">{selectedArchivage.signalement.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Statut:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    selectedArchivage.signalement.statut === 'résolu'
                      ? 'bg-green-100 text-green-800'
                      : selectedArchivage.signalement.statut === 'cours'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedArchivage.signalement.statut === 'résolu' ? 'Résolu' :
                     selectedArchivage.signalement.statut === 'cours' ? 'En cours' : 'En attente'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Catégorie:</span>
                  <span className="ml-2">{selectedArchivage.signalement.catégorie?.nomCategorie}</span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Créé par:</span>
                <span className="ml-2">{selectedArchivage.signalement.utilisateur?.nom}</span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Date de création:</span>
                <span className="ml-2">{moment(selectedArchivage.signalement.dateCréation).format('DD/MM/YYYY à HH:mm')}</span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Adresse:</span>
                <span className="ml-2">{selectedArchivage.signalement.position?.adresse}</span>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Informations d'archivage</h3>
                <div>
                  <span className="text-sm font-medium text-gray-500">Archivé le:</span>
                  <span className="ml-2">{moment(selectedArchivage.dateArchivage).format('DD/MM/YYYY à HH:mm')}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Archivé par:</span>
                  <span className="ml-2">{selectedArchivage.archivedBy?.nom}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Raison:</span>
                  <p className="mt-1 text-gray-700">{selectedArchivage.raison}</p>
                </div>
              </div>

              {selectedArchivage.signalement.photoUrl && selectedArchivage.signalement.photoUrl !== 'no-photo.jpg' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Photo</h3>
                  <img
                    src={`http://localhost:5000/uploads/images/${selectedArchivage.signalement.photoUrl}`}
                    alt="Signalement archivé"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  handleUnarchive(selectedArchivage._id, selectedArchivage.signalement.titre);
                  setShowModal(false);
                }}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
              >
                <FaUndo className="mr-2" /> Désarchiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GestionArchivages = () => {
  return (
    <Routes>
      <Route path="/" element={<ArchivagesList />} />
    </Routes>
  );
};

export default GestionArchivages;