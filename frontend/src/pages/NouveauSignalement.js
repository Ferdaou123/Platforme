import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FaUpload, FaMapMarkerAlt, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import api, { uploadSignalementPhoto } from '../utils/api';
import Spinner from '../components/layout/Spinner';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41]
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return position ? (
    <Marker position={position} icon={defaultIcon} />
  ) : null;
};

const NouveauSignalement = () => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    catégorie: '',
    position: {
      type: 'Point',
      coordinates: [],
      adresse: ''
    }
  });
  const [userPosition, setUserPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await api.get('/categories');
        setCategories(categoriesRes.data.data);
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = [
                position.coords.latitude,
                position.coords.longitude
              ];
              setUserPosition(pos);
              setMarkerPosition(pos);
              
              setFormData(prev => ({
                ...prev,
                position: {
                  ...prev.position,
                  coordinates: [position.coords.longitude, position.coords.latitude]
                }
              }));
              
              reverseGeocode(pos[0], pos[1]);
            },
            () => {
              const defaultPos = [31.5131, -9.7683];
              setUserPosition(defaultPos);
              setMarkerPosition(defaultPos);
              setFormData(prev => ({
                ...prev,
                position: {
                  ...prev.position,
                  coordinates: [-9.7683, 31.5131]
                }
              }));
            }
          );
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          position: {
            ...prev.position,
            adresse: data.display_name
          }
        }));
      }
    } catch (err) {
      // Géocodage inversé échoué - pas critique
    }
  };

  const handleMarkerPositionChange = (position) => {
    setMarkerPosition(position);
    
    setFormData(prev => ({
      ...prev,
      position: {
        ...prev.position,
        coordinates: [position[1], position[0]]
      }
    }));
    
    reverseGeocode(position[0], position[1]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleAddressChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      position: {
        ...prev.position,
        adresse: value
      }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.titre.trim()) {
      setError('Veuillez ajouter un titre');
      return;
    }
    if (!formData.description.trim()) {
      setError('Veuillez ajouter une description');
      return;
    }
    if (!formData.catégorie) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }
    if (!formData.position.coordinates.length) {
      setError('Veuillez sélectionner un emplacement sur la carte');
      return;
    }
  
    setIsSubmitting(true);
    setError('');
    setSuccess('');
  
    try {
      const res = await api.post('/signalements', formData);
      const signalementId = res.data.data._id;

      if (fileInputRef.current?.files?.length > 0) {
        const file = fileInputRef.current.files[0];
        const fd = new FormData();
        fd.append('file', file);
        
        await uploadSignalementPhoto(signalementId, fd);
      }

      setSuccess('Signalement créé avec succès');
      
      setTimeout(() => {
        navigate(`/signalements/${signalementId}`);
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du signalement');
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Nouveau signalement</h1>
        
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
        
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du signalement *
                </label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  placeholder="Ex: Lampadaire cassé, Nid de poule, etc."
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description détaillée *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez le problème en détail..."
                  className="input min-h-[150px]"
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="catégorie" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  id="catégorie"
                  name="catégorie"
                  value={formData.catégorie}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.nomCategorie}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  id="adresse"
                  name="adresse"
                  value={formData.position.adresse}
                  onChange={handleAddressChange}
                  placeholder="L'adresse sera automatiquement déterminée lorsque vous cliquez sur la carte"
                  className="input"
                  readOnly
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  <FaMapMarkerAlt className="inline mr-1" /> 
                  Cliquez sur la carte pour sélectionner l'emplacement exact
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo du problème
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                  <input
                    id="file-upload"
                    name="file"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  {previewImage ? (
                    <div className="text-center">
                      <img
                        src={previewImage}
                        alt="Aperçu du fichier sélectionné"
                        className="mx-auto h-32 w-auto object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-center flex flex-col items-center"
                    >
                      <FaUpload className="h-12 w-12 text-gray-400" />
                      <span className="mt-2 text-sm font-medium text-primary-600">
                        Télécharger une photo
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF jusqu'à 5MB
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localisation sur la carte *
              </label>
              <div className="rounded-md overflow-hidden border border-gray-300 h-[500px]">
                {userPosition && (
                  <MapContainer
                    center={userPosition}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      position={markerPosition}
                      setPosition={handleMarkerPositionChange}
                    />
                  </MapContainer>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Les coordonnées exactes seront enregistrées
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary py-3 px-8 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Envoi en cours...
                </>
              ) : (
                'Envoyer le signalement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NouveauSignalement;