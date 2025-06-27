import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FaClipboardList, FaUsers, FaTags, FaCogs, FaExclamationCircle, FaCheckCircle, FaClock, FaArchive, FaComment } from 'react-icons/fa';
import Sidebar from '../../components/admin/Sidebar';
import StatCard from '../../components/admin/StatCard';
import Spinner from '../../components/layout/Spinner';
import api from '../../utils/api';
import GestionUtilisateurs from './GestionUtilisateurs';
import GestionCategories from './GestionCategories';
import GestionServices from './GestionServices';
import GestionSignalements from './GestionSignalements';
import GestionArchivages from './GestionArchivages';
import GestionCommentaires from './GestionCommentaires';
import Statistiques from './Statistiques';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [recentSignalements, setRecentSignalements] = useState([]);
  const [recentCommentaires, setRecentCommentaires] = useState([]);
  const [archiveStats, setArchiveStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/signalements/stats');
        setStats(statsRes.data.data);
        
        const signalRes = await api.get('/signalements?limit=5&sort=-dateCréation');
        const validSignalements = signalRes.data.data.filter(
          signalement => signalement && signalement.catégorie
        );
        setRecentSignalements(validSignalements);
        
        try {
          const commentRes = await api.get('/commentaires/admin/all?limit=5');
          setRecentCommentaires(commentRes.data.data);
        } catch (err) {
          setRecentCommentaires([]);
        }
        
        try {
          const archiveRes = await api.get('/archivages/stats');
          setArchiveStats(archiveRes.data.data);
        } catch (err) {
          // Statistiques d'archives non disponibles
        }
        
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'attente':
        return 'bg-red-100 text-red-800';
      case 'cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'résolu':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'attente':
        return 'En attente';
      case 'cours':
        return 'En cours';
      case 'résolu':
        return 'Résolu';
      default:
        return statut;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total des signalements"
            value={stats.totalSignalements}
            icon={<FaClipboardList className="text-white text-xl" />}
            color="blue"
            footer="Nombre total de signalements"
          />
          
          <StatCard
            title="En attente"
            value={stats.statsByStatus?.find(s => s._id === 'attente')?.count || 0}
            icon={<FaExclamationCircle className="text-white text-xl" />}
            color="red"
            footer="Signalements à traiter"
          />
          
          <StatCard
            title="En cours"
            value={stats.statsByStatus?.find(s => s._id === 'cours')?.count || 0}
            icon={<FaClock className="text-white text-xl" />}
            color="yellow"
            footer="Signalements en traitement"
          />
          
          <StatCard
            title="Résolus"
            value={stats.statsByStatus?.find(s => s._id === 'résolu')?.count || 0}
            icon={<FaCheckCircle className="text-white text-xl" />}
            color="green"
            footer={`Taux de résolution: ${stats.resolutionRate?.toFixed(1) || 0}%`}
          />
        </div>
      )}

      {archiveStats && (
        <div className="mb-8">
          <StatCard
            title="Signalements archivés"
            value={archiveStats.totalArchivages}
            icon={<FaArchive className="text-white text-xl" />}
            color="purple"
            footer="Signalements archivés au total"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Signalements récents</h2>
            <Link to="/dashboard/signalements" className="text-primary-600 hover:underline">
              Voir tous
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentSignalements.slice(0, 5).map(signalement => (
              <div key={signalement._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {signalement.titre}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {signalement.catégorie?.nomCategorie || 'Catégorie non définie'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(signalement.statut)}`}>
                    {getStatusText(signalement.statut)}
                  </span>
                  <Link
                    to={`/signalements/${signalement._id}`}
                    className="text-primary-600 hover:text-primary-900 text-sm"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
            
            {recentSignalements.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Aucun signalement récent
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Commentaires récents</h2>
            <Link to="/dashboard/commentaires" className="text-primary-600 hover:underline">
              Voir tous
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentCommentaires.slice(0, 5).map(commentaire => (
              <div key={commentaire._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                <FaComment className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {commentaire.contenu}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Par {commentaire.utilisateur?.nom || 'Utilisateur inconnu'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {new Date(commentaire.dateCréation).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    to={`/signalements/${commentaire.signalement?._id}`}
                    className="text-primary-600 hover:text-primary-900 text-xs"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
            
            {recentCommentaires.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Aucun commentaire récent
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Accès rapide</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            to="/dashboard/signalements"
            className="flex flex-col items-center p-4 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <FaClipboardList className="mb-2 text-2xl" />
            <span className="text-sm font-medium">Signalements</span>
          </Link>
          
          <Link
            to="/dashboard/commentaires"
            className="flex flex-col items-center p-4 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
          >
            <FaComment className="mb-2 text-2xl" />
            <span className="text-sm font-medium">Commentaires</span>
          </Link>
          
          <Link
            to="/dashboard/utilisateurs"
            className="flex flex-col items-center p-4 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
          >
            <FaUsers className="mb-2 text-2xl" />
            <span className="text-sm font-medium">Utilisateurs</span>
          </Link>
          
          <Link
            to="/dashboard/categories"
            className="flex flex-col items-center p-4 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
          >
            <FaTags className="mb-2 text-2xl" />
            <span className="text-sm font-medium">Catégories</span>
          </Link>
          
          <Link
            to="/dashboard/services"
            className="flex flex-col items-center p-4 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <FaCogs className="mb-2 text-2xl" />
            <span className="text-sm font-medium">Services</span>
          </Link>

          <Link
            to="/dashboard/archives"
            className="flex flex-col items-center p-4 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FaArchive className="mb-2 text-2xl" />
            <span className="text-sm font-medium">Archives</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/signalements/*" element={<GestionSignalements />} />
          <Route path="/commentaires/*" element={<GestionCommentaires />} />
          <Route path="/utilisateurs/*" element={<GestionUtilisateurs />} />
          <Route path="/categories/*" element={<GestionCategories />} />
          <Route path="/services/*" element={<GestionServices />} />
          <Route path="/archives/*" element={<GestionArchivages />} />
          <Route path="/statistiques" element={<Statistiques />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;