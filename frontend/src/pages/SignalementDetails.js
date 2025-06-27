import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FaCalendarAlt, FaUser, FaMapMarkerAlt, FaTag, FaThumbsUp, FaEdit, FaTrash, FaSpinner, FaComment, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import Spinner from '../components/layout/Spinner';
import Alert from '../components/layout/Alert';
import CommentSection from '../components/commentaires/CommentSection';

moment.locale('fr');

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SignalementDetails = () => {
  const { id } = useParams();
  const [signalement, setSignalement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const authContext = useContext(AuthContext);
  const { user, isAdmin } = authContext || {};
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSignalement = async () => {
      try {
        const res = await api.get(`/signalements/${id}`);
        setSignalement(res.data.data);
        
        if (user) {
          try {
            const voteRes = await api.get(`/signalements/${id}/votes/check`);
            setHasVoted(voteRes.data.hasVoted);
          } catch (err) {
            // Ignorer les erreurs de vérification de vote
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement du signalement');
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchSignalement();
    }
  }, [id, user]);

  const handleVote = async () => {
    if (!user) {
      setError('Veuillez vous connecter pour voter');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setIsVoting(true);
    setError('');
    setSuccess('');
    
    try {
      if (hasVoted) {
        await api.delete(`/signalements/${id}/vote`);
        setSuccess('Vote retiré avec succès');
        setHasVoted(false);
        
        setSignalement(prev => ({
          ...prev,
          compteurVotes: Math.max((prev.compteurVotes || 0) - 1, 0)
        }));
      } else {
        await api.post(`/signalements/${id}/vote`);
        setSuccess('Vote ajouté avec succès');
        setHasVoted(true);
        
        setSignalement(prev => ({
          ...prev,
          compteurVotes: (prev.compteurVotes || 0) + 1
        }));
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/signalements/${id}`);
      setSuccess('Signalement supprimé avec succès');
      setTimeout(() => navigate('/signalements'), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const getStatusClass = (statut) => {
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

  const canEdit = user && signalement && (
    user._id === signalement.utilisateur?._id || 
    (isAdmin && typeof isAdmin === 'function' && isAdmin())
  );

  const canManage = user && isAdmin && typeof isAdmin === 'function' && isAdmin();

  if (isLoading) {
    return <Spinner />;
  }

  if (error && !signalement) {
    return <Alert type="error" message={error} />;
  }

  if (!signalement) {
    return <Alert type="error" message="Signalement non trouvé" />;
  }

  if (!signalement.position || !signalement.position.coordinates || signalement.position.coordinates.length < 2) {
    return <Alert type="error" message="Données de géolocalisation manquantes" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/signalements" className="text-primary-600 hover:underline flex items-center">
          &larr; Retour aux signalements
        </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card overflow-hidden">
            <div className="relative">
              <img
                src={signalement.photoUrl && signalement.photoUrl !== 'no-photo.jpg'
                  ? `http://localhost:5000/uploads/images/${signalement.photoUrl}`
                  : 'https://via.placeholder.com/800x400?text=Pas+d%27image'}
                alt={signalement.titre || 'Signalement'}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=Erreur+chargement+image';
                }}
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(signalement.statut)}`}>
                  {getStatusText(signalement.statut)}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{signalement.titre}</h1>
                
                {canEdit && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/signalements/${signalement._id}/edit`}
                      className="btn bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
                      title="Modifier"
                    >
                      <FaEdit />
                    </Link>
                    
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="btn bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <FaCalendarAlt className="mr-2 text-primary-500" />
                  <span>
                    Signalé {moment(signalement.dateCréation).fromNow()} 
                    ({moment(signalement.dateCréation).format('LL')})
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <FaUser className="mr-2 text-primary-500" />
                  <span>Par {signalement.utilisateur?.nom || 'Utilisateur inconnu'}</span>
                </div>
                
                {signalement.catégorie && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FaTag className="mr-2 text-primary-500" />
                    <span>{signalement.catégorie.nomCategorie}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{signalement.description}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-800 mr-2">{signalement.compteurVotes || 0}</span>
                    <span className="text-gray-600">votes</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FaComment className="mr-2 text-primary-500" />
                    <span className="text-gray-600">{signalement.compteurCommentaires || 0} commentaires</span>
                  </div>
                </div>
                
                <button
                  onClick={handleVote}
                  className={`px-4 py-2 rounded-md flex items-center font-medium ${
                    hasVoted ? 'bg-primary-100 text-primary-800' : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  disabled={isVoting}
                >
                  {isVoting ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaThumbsUp className="mr-2" />
                  )}
                  {hasVoted ? 'Vous avez voté' : 'Soutenir ce signalement'}
                </button>
              </div>
              
              {canManage && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions administratives</h2>
                  <div className="flex gap-4">
                    <select
                      className="input w-full"
                      value={signalement.statut}
                      onChange={async (e) => {
                        try {
                          const res = await api.put(`/signalements/${signalement._id}`, {
                            statut: e.target.value
                          });
                          setSignalement(res.data.data);
                          setSuccess('Statut mis à jour avec succès');
                          setTimeout(() => setSuccess(''), 3000);
                        } catch (err) {
                          setError('Erreur lors de la mise à jour du statut');
                        }
                      }}
                    >
                      <option value="attente">En attente</option>
                      <option value="cours">En cours</option>
                      <option value="résolu">Résolu</option>
                    </select>
                    
                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        try {
                          await api.post('/archivages', {
                            signalement: signalement._id,
                            raison: 'Résolution terminée'
                          });
                          setSuccess('Signalement archivé avec succès');
                          setTimeout(() => navigate('/signalements'), 1000);
                        } catch (err) {
                          setError('Erreur lors de l\'archivage');
                        }
                      }}
                    >
                      Archiver
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CommentSection signalementId={signalement._id} />
        </div>
        
        <div>
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Localisation</h2>
            <div className="rounded-md overflow-hidden mb-4 h-64">
              <MapContainer
                center={[signalement.position.coordinates[1], signalement.position.coordinates[0]]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[signalement.position.coordinates[1], signalement.position.coordinates[0]]}
                  icon={defaultIcon}
                >
                  <Popup>
                    <div>
                      <strong>{signalement.titre}</strong>
                      <p>{signalement.position.adresse || 'Emplacement sur la carte'}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="flex items-start text-gray-700">
              <FaMapMarkerAlt className="text-primary-500 mt-1 mr-2 flex-shrink-0" />
              <span>
                {signalement.position.adresse || 'Emplacement exact sur la carte'}
              </span>
            </div>
          </div>
          
          {signalement.service && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Service en charge</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-bold text-gray-800">
                  {signalement.service.nomService}
                </h3>
                {signalement.service.description && (
                  <p className="text-gray-600 mt-2">
                    {signalement.service.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmer la suppression</h2>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalementDetails;