import React from 'react';
import { FaMapMarkerAlt, FaUsers, FaRegThumbsUp, FaRegClipboard } from 'react-icons/fa';
import cityImage from '../assets/essaouira.jpg';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-primary-700 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={cityImage}
            alt="Essaouira"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="container mx-auto px-4 py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              À propos d'
              <span className="text-cyan-300">MogaAlert</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 leading-relaxed">
              Un projet citoyen pour améliorer la qualité de vie à Essaouira en permettant
              aux habitants de signaler et suivre les problèmes urbains.
            </p>
          </div>
        </div>
      </div>

      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <img 
                  src="https://tse1.mm.bing.net/th?id=OIP.RFSF64XOLco1YsZPIS6TLgHaFY&pid=Api&P=0&h=180" 
                  alt="Médina d'Essaouira"
                  className="w-full h-56 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <img 
                  src="https://tse3.mm.bing.net/th?id=OIP.LynoZTJ1Ro9E6yi6mERXEwHaE8&pid=Api&P=0&h=180" 
                  alt="Remparts historiques"
                  className="w-full h-40 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
              <div className="space-y-6 pt-12">
                <img 
                  src="https://tse2.mm.bing.net/th?id=OIP.q7PwCzinhLy7X5feg2lH4gHaE8&pid=Api&P=0&h=180" 
                  alt="Port d'Essaouira"
                  className="w-full h-40 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <img 
                  src="https://tse4.mm.bing.net/th?id=OIP.aSl6HM98qX433t32YR40tQHaE7&pid=Api&P=0&h=180" 
                  alt="Plage d'Essaouira"
                  className="w-full h-56 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">Notre Mission</h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  MogaAlert est né d'un constat simple : les citoyens sont les mieux placés pour identifier les problèmes
                  de leur ville, mais il manquait un outil efficace pour signaler ces problèmes et suivre leur résolution.
                </p>
                <p>
                  Notre mission est de créer un lien direct entre les habitants d'Essaouira et les services municipaux,
                  afin d'améliorer l'environnement urbain et la qualité de vie pour tous.
                </p>
                <p>
                  Grâce à cette plateforme, nous facilitons la participation citoyenne et rendons la gestion urbaine
                  plus transparente et efficace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-16 text-center">Comment ça marche ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative">
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center group-hover:shadow-2xl group-hover:-translate-y-4 transition-all duration-500 border border-gray-100">
                <div className="mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Signaler un problème"
                    className="w-full h-40 object-cover rounded-2xl mb-4"
                  />
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 group-hover:scale-110 transition-transform">
                    <FaMapMarkerAlt className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Signalez</h3>
                <p className="text-gray-600">
                  Localisez et photographiez un problème urbain, puis soumettez-le via notre application.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center group-hover:shadow-2xl group-hover:-translate-y-4 transition-all duration-500 delay-100 border border-gray-100">
                <div className="mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Voter pour les signalements"
                    className="w-full h-40 object-cover rounded-2xl mb-4"
                  />
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 group-hover:scale-110 transition-transform">
                    <FaRegThumbsUp className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Votez</h3>
                <p className="text-gray-600">
                  Soutenez les signalements qui vous semblent prioritaires pour aider à définir les urgences.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center group-hover:shadow-2xl group-hover:-translate-y-4 transition-all duration-500 delay-200 border border-gray-100">
                <div className="mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Suivre la résolution"
                    className="w-full h-40 object-cover rounded-2xl mb-4"
                  />
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 group-hover:scale-110 transition-transform">
                    <FaRegClipboard className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Suivez</h3>
                <p className="text-gray-600">
                  Consultez en temps réel le statut et l'avancement de la résolution des problèmes signalés.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center group-hover:shadow-2xl group-hover:-translate-y-4 transition-all duration-500 delay-300 border border-gray-100">
                <div className="mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Participation citoyenne"
                    className="w-full h-40 object-cover rounded-2xl mb-4"
                  />
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 group-hover:scale-110 transition-transform">
                    <FaUsers className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Participez</h3>
                <p className="text-gray-600">
                  Contribuez à l'amélioration de votre ville et rejoignez une communauté de citoyens engagés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-16 text-center">Contexte</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Essaouira, charmante ville côtière du Maroc, accueille environ 90 000 habitants et plus de 250 000 touristes
                  chaque année. Cette affluence, combinée à une infrastructure urbaine en constante évolution, crée des défis
                  spécifiques.
                </p>
                
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Les défis urbains d'Essaouira :</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>Saturation des ruelles étroites de la Médina, particulièrement en haute saison touristique</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>Infrastructures d'éclairage public défaillantes dans certains quartiers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>Gestion des déchets et propreté des espaces publics</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>Maintenance des espaces verts et du patrimoine historique</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span>Signalisation et accessibilité dans les zones à forte affluence</span>
                    </li>
                  </ul>
                </div>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  MogaAlert s'inscrit dans une démarche de ville intelligente et participative, où la technologie
                  est mise au service des citoyens pour créer un dialogue constructif avec les autorités locales.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://tse2.mm.bing.net/th?id=OIP.pzDpnb7FLNDFkj61DmmqewHaEK&pid=Api&P=0&h=180" 
                  alt="Artisans d'Essaouira"
                  className="w-full h-48 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                />
                <img 
                  src="https://tse2.mm.bing.net/th?id=OIP.YupSi7EzK8etkHh-4L-7cwHaEK&pid=Api&P=0&h=180" 
                  alt="Infrastructure urbaine"
                  className="w-full h-48 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow mt-8"
                />
                <img 
                  src="https://tse1.mm.bing.net/th?id=OIP.4TTPZyhu4UBUZnutWRVrSwHaE8&pid=Api&P=0&h=180" 
                  alt="Espaces publics"
                  className="w-full h-48 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow -mt-8"
                />
                <img 
                  src="https://tse2.mm.bing.net/th?id=OIP.q7PwCzinhLy7X5feg2lH4gHaE8&pid=Api&P=0&h=180" 
                  alt="Maintenance urbaine"
                  className="w-full h-48 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1539650116574-75c0c6d4d13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Essaouira background"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
};

export default About;