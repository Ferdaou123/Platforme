import React, { useState, useContext, useEffect } from 'react';
import { FaUser, FaEnvelope, FaKey, FaSpinner, FaUserCircle, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/layout/Spinner';

const Profile = () => {
  const { user, updateProfile, updatePassword, isLoading } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState({
    nom: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    mot_de_passe_actuel: '',
    nouveau_mot_de_passe: '',
    confirmer_mot_de_passe: ''
  });
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  useEffect(() => {
    if (user) {
      setProfileData({
        nom: user.nom || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    if (profileError) setProfileError('');
    if (profileSuccess) setProfileSuccess('');
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.nom || !profileData.email) {
      setProfileError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsSubmittingProfile(true);
    setProfileError('');
    setProfileSuccess('');
    
    const success = await updateProfile(profileData);
    
    setIsSubmittingProfile(false);
    
    if (success) {
      setProfileSuccess('Profil mis à jour avec succès');
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError('Erreur lors de la mise à jour du profil');
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const { mot_de_passe_actuel, nouveau_mot_de_passe, confirmer_mot_de_passe } = passwordData;
    
    if (!mot_de_passe_actuel || !nouveau_mot_de_passe || !confirmer_mot_de_passe) {
      setPasswordError('Veuillez remplir tous les champs');
      return;
    }
    
    if (nouveau_mot_de_passe !== confirmer_mot_de_passe) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (nouveau_mot_de_passe.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsSubmittingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');
    
    const success = await updatePassword({
      mot_de_passe_actuel,
      nouveau_mot_de_passe
    });
    
    if (success) {
      setPasswordSuccess('Mot de passe mis à jour avec succès');
      setPasswordData({
        mot_de_passe_actuel: '',
        nouveau_mot_de_passe: '',
        confirmer_mot_de_passe: ''
      });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } else {
      setPasswordError('Erreur lors de la mise à jour du mot de passe');
    }
    
    setIsSubmittingPassword(false);
  };
  
  if (isLoading) {
    return <Spinner />;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            <FaExclamationTriangle className="inline mr-2" />
            Veuillez vous connecter pour accéder à votre profil.
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mon profil</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser className="inline mr-2" /> Informations personnelles
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'password'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('password')}
            >
              <FaKey className="inline mr-2" /> Changer de mot de passe
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' ? (
              <div>
                <div className="mb-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
                    <FaUserCircle className="text-6xl text-gray-400" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-gray-800">
                    {user.nom}
                  </h2>
                  <p className="text-gray-600">{user.rôle}</p>
                </div>

                {profileError && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {profileError}
                  </div>
                )}
                
                {profileSuccess && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 flex items-center">
                    <FaCheck className="mr-2" />
                    {profileSuccess}
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-4">
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={profileData.nom}
                        onChange={handleProfileChange}
                        className="input pl-10"
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="input pl-10"
                        placeholder="Votre email"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isSubmittingProfile}
                  >
                    {isSubmittingProfile ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Mise à jour...
                      </>
                    ) : (
                      'Mettre à jour le profil'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {passwordError && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 flex items-center">
                    <FaCheck className="mr-2" />
                    {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label htmlFor="mot_de_passe_actuel" className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      id="mot_de_passe_actuel"
                      name="mot_de_passe_actuel"
                      value={passwordData.mot_de_passe_actuel}
                      onChange={handlePasswordChange}
                      className="input"
                      placeholder="Entrez votre mot de passe actuel"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="nouveau_mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="nouveau_mot_de_passe"
                      name="nouveau_mot_de_passe"
                      value={passwordData.nouveau_mot_de_passe}
                      onChange={handlePasswordChange}
                      className="input"
                      placeholder="Entrez votre nouveau mot de passe"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Le mot de passe doit contenir au moins 6 caractères
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmer_mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmer_mot_de_passe"
                      name="confirmer_mot_de_passe"
                      value={passwordData.confirmer_mot_de_passe}
                      onChange={handlePasswordChange}
                      className="input"
                      placeholder="Confirmez votre nouveau mot de passe"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isSubmittingPassword}
                  >
                    {isSubmittingPassword ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Mise à jour...
                      </>
                    ) : (
                      'Changer le mot de passe'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;