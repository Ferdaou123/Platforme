import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaThumbsUp, FaComment } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import api from '../../utils/api'; // ajuste le chemin si besoin

moment.locale('fr');

const SignalementItem = ({ signalement }) => {
  // On retire '/api/v1' de la baseURL pour obtenir l'hôte
  const API_HOST = api.defaults.baseURL.replace('/api/v1', '');
  const imgSrc =
    signalement.photoUrl && signalement.photoUrl !== 'no-photo.jpg'
      ? `${API_HOST}/uploads/images/${signalement.photoUrl}`
      : 'https://via.placeholder.com/300x200?text=Pas+d%27image';

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

  return (
    <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <img
          src={imgSrc}
          alt={signalement.titre}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Erreur';
          }}
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
              signalement.statut
            )}`}
          >
            {getStatusText(signalement.statut)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {signalement.titre}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {signalement.description}
        </p>

        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FaMapMarkerAlt className="mr-2 text-primary-500" />
            <span>
              {signalement.position.adresse || 'Adresse non spécifiée'}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <FaCalendarAlt className="mr-2 text-primary-500" />
            <span>{moment(signalement.dateCréation).fromNow()}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <FaUser className="mr-2 text-primary-500" />
            <span>
              {signalement.utilisateur?.nom || 'Utilisateur inconnu'}
            </span>
          </div>

          {/* NOUVEAU : Ligne avec votes et commentaires côte à côte */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <FaThumbsUp className="mr-2 text-primary-500" />
              <span>{signalement.compteurVotes || 0} votes</span>
            </div>
            
            <div className="flex items-center">
              <FaComment className="mr-2 text-primary-500" />
              <span>{signalement.compteurCommentaires || 0} commentaires</span>
            </div>
          </div>
        </div>

        <Link
          to={`/signalements/${signalement._id}`}
          className="btn btn-primary w-full text-center"
        >
          Voir détails
        </Link>
      </div>
    </div>
  );
};

export default SignalementItem;