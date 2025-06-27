import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import { toast } from 'react-toastify';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nomCategorie: '',
    description: '',
    icone: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
        setIsLoading(false);
      } catch (err) {
        toast.error('Erreur lors du chargement des catégories');
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCategory = () => {
    setFormData({
      nomCategorie: '',
      description: '',
      icone: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      nomCategorie: category.nomCategorie,
      description: category.description || '',
      icone: category.icone || ''
    });
    setEditMode(true);
    setCurrentCategoryId(category._id);
    setShowModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter(category => category._id !== id));
        toast.success('Catégorie supprimée avec succès');
      } catch (err) {
        toast.error('Erreur lors de la suppression de la catégorie');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nomCategorie) {
      toast.error('Veuillez saisir un nom pour la catégorie');
      return;
    }
    
    try {
      if (editMode) {
        const res = await api.put(`/categories/${currentCategoryId}`, formData);
        setCategories(categories.map(category => 
          category._id === currentCategoryId ? res.data.data : category
        ));
        toast.success('Catégorie mise à jour avec succès');
      } else {
        const res = await api.post('/categories', formData);
        setCategories([...categories, res.data.data]);
        toast.success('Catégorie ajoutée avec succès');
      }
      setShowModal(false);
    } catch (err) {
      toast.error('Erreur lors de l\'opération');
    }
  };

  const filteredCategories = categories.filter(category => 
    category.nomCategorie.toLowerCase().includes(search.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des catégories</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une catégorie..."
              className="input pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={handleAddCategory}
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" /> Ajouter une catégorie
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {category.icone ? (
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <img
                          src={`http://localhost:5000/uploads/icons/${category.icone}`}
                          alt={category.nomCategorie}
                          className="w-6 h-6"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/24?text=Icon';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 text-xl">?</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-800">
                      {category.nomCategorie}
                    </h3>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600">
                  {category.description || 'Aucune description'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Aucune catégorie trouvée
            </h3>
            <button
              onClick={handleAddCategory}
              className="btn btn-primary"
            >
              <FaPlus className="mr-2 inline" /> Ajouter une catégorie
            </button>
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editMode ? 'Modifier une catégorie' : 'Ajouter une catégorie'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nomCategorie" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  id="nomCategorie"
                  name="nomCategorie"
                  value={formData.nomCategorie}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-4">
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
              
              <div className="mb-6">
                <label htmlFor="icone" className="block text-sm font-medium text-gray-700 mb-1">
                  Icône
                </label>
                <input
                  type="text"
                  id="icone"
                  name="icone"
                  value={formData.icone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Nom du fichier icône (ex: category-icon.png)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Entrez le nom du fichier icône. Les icônes doivent être préalablement téléchargées dans le dossier d'upload.
                </p>
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

const GestionCategories = () => {
  return (
    <Routes>
      <Route path="/" element={<CategoriesList />} />
    </Routes>
  );
};

export default GestionCategories;