import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MogaAlert</h3>
            <p className="mb-4">
              Plateforme citoyenne pour signaler et prioriser les problèmes urbains à Essaouira.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-400">
                <FaFacebook className="text-xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-400">
                <FaTwitter className="text-xl" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-400">
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/signalements" className="text-gray-300 hover:text-white transition-colors">
                  Signalements
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-gray-300 hover:text-white transition-colors">
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaPhone className="mr-2" /> +212 605953512
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2" /> contact@MogaAlert.ma
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Faire un Signalement</h3>
            <p className="mb-4">
              Vous avez remarqué un problème dans votre quartier ? Signalez-le facilement en quelques clics.
            </p>
            <Link to="/nouveau-signalement" className="btn btn-primary inline-block">
              Nouveau Signalement
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>&copy; {currentYear} MogaAlert. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;