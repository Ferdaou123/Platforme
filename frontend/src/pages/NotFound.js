import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <FaExclamationTriangle className="text-yellow-500 text-7xl mx-auto mb-6" />
        
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-8">Page non trouvée</h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn btn-primary flex items-center">
            <FaHome className="mr-2" /> Retour à l'accueil
          </Link>
          
          <Link to="/signalements" className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center">
            <FaSearch className="mr-2" /> Explorer les signalements
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;