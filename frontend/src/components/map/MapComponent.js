import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Spinner from '../layout/Spinner';

// Résoudre le problème des icônes par défaut de Leaflet
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Composant pour centrer la carte automatiquement sur la position de l'utilisateur
const LocateUser = ({ position, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.flyTo(position, zoom);
    }
  }, [map, position, zoom]);
  
  return null;
};

const MapComponent = ({ signalements, height = '500px' }) => {
  const [userPosition, setUserPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Position par défaut (Essaouira)
  const defaultPosition = [31.5131, -9.7683];
  
  useEffect(() => {
    // Obtenir la position de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([
            position.coords.latitude,
            position.coords.longitude
          ]);
          setIsLoading(false);
        },
        () => {
          // En cas d'erreur, utiliser la position par défaut
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const getMarkerColor = (statut) => {
    switch (statut) {
      case 'attente':
        return 'red';
      case 'cours':
        return 'orange';
      case 'résolu':
        return 'green';
      default:
        return 'blue';
    }
  };
  
  if (isLoading) {
    return <Spinner />;
  }
  
  return (
    <MapContainer
      center={userPosition || defaultPosition}
      zoom={14}
      style={{ height, width: '100%' }}
      className="rounded-lg shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <LocateUser
        position={userPosition || defaultPosition}
        zoom={14}
      />
      
      {userPosition && (
        <Marker
          position={userPosition}
          icon={L.divIcon({
            className: 'user-marker',
            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        >
          <Popup>
            <div>
              <p className="font-bold">Votre position</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {signalements && signalements.map(signalement => (
        <Marker
          key={signalement._id}
          position={[
            signalement.position.coordinates[1],
            signalement.position.coordinates[0]
          ]}
          icon={L.divIcon({
            className: 'signalement-marker',
            html: `<div class="w-6 h-6 bg-${getMarkerColor(signalement.statut)}-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs">${signalement.compteurVotes || 0}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-lg mb-1">{signalement.titre}</h3>
              <p className="text-sm text-gray-600 mb-2">{signalement.description.substring(0, 100)}...</p>
              <div className="flex justify-between items-center mb-2">
                <span className={`px-2 py-1 rounded-full text-xs text-white bg-${getMarkerColor(signalement.statut)}-500`}>
                  {signalement.statut.charAt(0).toUpperCase() + signalement.statut.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(signalement.dateCréation).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => navigate(`/signalements/${signalement._id}`)}
                className="btn btn-primary btn-sm w-full"
              >
                Voir détails
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;