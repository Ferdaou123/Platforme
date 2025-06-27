import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt, FaSpinner, FaUpload, FaArrowLeft, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
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
  return position ? <Marker position={position} icon={defaultIcon} /> : null;
};

const EditSignalement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    catégorie: '',
    statut: '',
    position: {
      type: 'Point',
      coordinates: [],
      adresse: ''
    }
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [originalSignalement, setOriginalSignalement] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await api.get('/categories');
        setCategories(categoriesRes.data.data);
        
        const signalementRes = await api.get(`/signalements/${id}`);
        const signalement = signalementRes.data.data;
        
        if (!user || (!isAdmin() && signalement.utilisateur._id !== user._id)) {
          setError('Vous n\'avez pas les permissions pour modifier ce signalement');
          setTimeout(() => navigate('/signalements'), 2000);
          return;
        }
        
        setOriginalSignalement(signalement);
        setFormData({
          titre: signalement.titre,
          description: signalement.description,
          catégorie: signalement.catégorie._id,
          statut: signalement.statut,
          position: signalement.position
        });
        
        setMarkerPosition([
          signalement.position.coordinates[1],
          signalement.position.coordinates[0]
        ]);
        
        if (signalement.photoUrl && signalement.photoUrl !== 'no-photo.jpg') {
          setCurrentPhoto(signalement.photoUrl);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setTimeout(() => navigate('/signalements'), 2000);
      }
    };
    fetchData();
  }, [id, navigate, user, isAdmin]);

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
        setCurrentPhoto(null);
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
      const updateData = {
        titre: formData.titre,
        description: formData.description,
        catégorie: formData.catégorie,
        position: formData.position
      };

      if (isAdmin()) {
        updateData.statut = formData.statut;
      }

      await api.put(`/signalements/${id}`, updateData);
      
      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        const file = fileInputRef.current.files[0];
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        await api.put(`/signalements/${id}/photo`, formDataFile);
      }
      
      setSuccess('Signalement mis à jour avec succès');
      setTimeout(() => {
        navigate(`/signalements/${id}`);
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du signalement');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!originalSignalement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            <FaExclamationTriangle className="inline mr-2" />
            Signalement non trouvé
          </div>
          <button
            onClick={() => navigate('/signalements')}
            className="btn btn-primary"
          >
            Retour aux signalements
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(`/signalements/${id}`)}
            className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 mr-4"
          >
            <FaArrowLeft className="mr-2" /> Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Modifier le signalement</h1>
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

              {isAdmin() && (
                <div>
                  <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    id="statut"
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="attente">En attente</option>
                    <option value="cours">En cours</option>
                    <option value="résolu">Résolu</option>
                  </select>
                </div>
              )}
              
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
                  Cliquez sur la carte pour modifier l'emplacement exact
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo du problème
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {previewImage ? (
                      <div>
                        <img
                          src={previewImage}
                          alt="Aperçu du fichier sélectionné"
                          className="mx-auto h-32 w-auto object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setCurrentPhoto(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : currentPhoto ? (
                      <div>
                        <img
                          src={`http://localhost:5000/uploads/images/${currentPhoto}`}
                          alt="Contenu actuel du signalement"
                          className="mx-auto h-32 w-auto object-cover rounded"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Photo actuelle
                        </p>
                        <button
                          type="button"
                          onClick={() => setCurrentPhoto(null)}
                          className="mt-1 text-sm text-red-600 hover:text-red-800"
                        >
                          Remplacer
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                          >
                            <span>Téléchargez une photo</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">ou glissez-déposez</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF jusqu'à 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localisation sur la carte *
              </label>
              <div className="rounded-md overflow-hidden border border-gray-300 h-[500px]">
                {markerPosition && (
                  <MapContainer
                    center={markerPosition}
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
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/signalements/${id}`)}
              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary py-3 px-8 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Mise à jour en cours...
                </>
              ) : (
                'Mettre à jour le signalement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSignalement;