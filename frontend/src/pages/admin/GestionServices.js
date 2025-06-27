import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import { toast } from 'react-toastify';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nomService: '',
    description: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesRes = await api.get('/services');
        setServices(servicesRes.data.data);
        setIsLoading(false);
      } catch (err) {
        toast.error('Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddService = () => {
    setFormData({
      nomService: '',
      description: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setFormData({
      nomService: service.nomService,
      description: service.description || ''
    });
    setEditMode(true);
    setCurrentService(service);
    setShowModal(true);
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await api.delete(`/services/${id}`);
        setServices(services.filter(service => service._id !== id));
        toast.success('Service supprimé avec succès');
      } catch (err) {
        toast.error('Erreur lors de la suppression du service');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nomService) {
      toast.error('Veuillez saisir un nom pour le service');
      return;
    }
    
    try {
      if (editMode) {
        const res = await api.put(`/services/${currentService._id}`, formData);
        setServices(services.map(service => 
          service._id === currentService._id ? res.data.data : service
        ));
        toast.success('Service mis à jour avec succès');
      } else {
        const res = await api.post('/services', formData);
        setServices([...services, res.data.data]);
        toast.success('Service ajouté avec succès');
      }
      setShowModal(false);
    } catch (err) {
      toast.error('Erreur lors de l\'opération');
    }
  };

  const filteredServices = services.filter(service => 
    service.nomService.toLowerCase().includes(search.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des services</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un service..."
              className="input pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={handleAddService}
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" /> Ajouter un service
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div
              key={service._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {service.nomService}
                  </h3>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {service.description || 'Aucune description'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Aucun service trouvé
            </h3>
            <button
              onClick={handleAddService}
              className="btn btn-primary"
            >
              <FaPlus className="mr-2 inline" /> Ajouter un service
            </button>
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editMode ? 'Modifier un service' : 'Ajouter un service'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nomService" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du service *
                </label>
                <input
                  type="text"
                  id="nomService"
                  name="nomService"
                  value={formData.nomService}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editMode ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GestionServices = () => {
  return (
    <Routes>
      <Route path="/" element={<ServicesList />} />
    </Routes>
  );
};

export default GestionServices;