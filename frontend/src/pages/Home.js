import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClipboardList, FaUsers, FaChartLine, FaExclamationCircle, FaCheckCircle, FaCog } from 'react-icons/fa';
import MapComponent from '../components/map/MapComponent';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import Spinner from '../components/layout/Spinner';
import cityImage from '../assets/essaouira.jpg';

const Home = () => {
  const [signalements, setSignalements] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const signalRes = await api.get('/signalements?limit=10&sort=-dateCréation');
        const statsRes = await api.get('/signalements/stats');
        
        setSignalements(signalRes.data.data);
        setStats(statsRes.data.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen">
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={cityImage}
            alt="Ville d'Essaouira"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Améliorons ensemble notre ville d'Essaouira
            </h1>
            <p className="text-xl mb-8">
              Signalez, votez et suivez la résolution des problèmes urbains dans votre quartier. Ensemble, rendons notre ville plus agréable à vivre.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/nouveau-signalement" className="btn btn-primary">
                  <FaExclamationCircle className="mr-2" /> Signaler un problème
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary">
                  <FaUsers className="mr-2" /> Rejoindre la communauté
                </Link>
              )}
              <Link to="/signalements" className="btn bg-white text-primary-600 hover:bg-gray-100">
                <FaClipboardList className="mr-2" /> Voir les signalements
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Carte des signalements</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explorez les problèmes urbains signalés à Essaouira sur cette carte interactive. Cliquez sur les marqueurs pour voir les détails.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <MapComponent signalements={signalements} height="600px" />
          </div>
        </div>
      </section>

      {stats && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Statistiques des signalements</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Découvrez les chiffres clés qui montrent l'impact de notre plateforme citoyenne.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-500 mb-4">
                  <FaClipboardList className="text-xl" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">{stats.totalSignalements}</h3>
                <p className="text-gray-600">Signalements au total</p>
              </div>
              <div className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-500 mb-4">
                  <FaCheckCircle className="text-xl" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">
                  {stats.statsByStatus.find(s => s._id === 'résolu')?.count || 0}
                </h3>
                <p className="text-gray-600">Problèmes résolus</p>
              </div>
              <div className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 mb-4">
                  <FaCog className="text-xl" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">
                  {stats.statsByStatus.find(s => s._id === 'cours')?.count || 0}
                </h3>
                <p className="text-gray-600">En cours de résolution</p>
              </div>
              <div className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-500 mb-4">
                  <FaChartLine className="text-xl" />
                </div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2">
                  {stats.resolutionRate.toFixed(1)}%
                </h3>
                <p className="text-gray-600">Taux de résolution</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Comment ça marche ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              MogaAlert vous permet de signaler facilement les problèmes urbains et de suivre leur résolution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FaMapMarkerAlt className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">1. Signalez un problème</h3>
              <p className="text-gray-600">
                Utilisez notre application pour signaler un problème urbain avec une photo, une description et une localisation précise.
              </p>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FaUsers className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">2. Votez pour les signalements</h3>
              <p className="text-gray-600">
                Soutenez les signalements qui vous semblent importants en votant pour eux, ce qui aide à prioriser les interventions.
              </p>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FaCheckCircle className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">3. Suivez la résolution</h3>
              <p className="text-gray-600">
                Recevez des notifications sur l'avancement de la résolution des problèmes que vous avez signalés ou soutenus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à améliorer votre ville ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté et contribuez à rendre Essaouira plus agréable à vivre pour tous ses habitants.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link to="/nouveau-signalement" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Signaler un problème
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
                  S'inscrire
                </Link>
                <Link to="/login" className="btn border border-white bg-transparent hover:bg-primary-700">
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;