import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa';
import { forgotPassword } from '../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordGenerated, setPasswordGenerated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await forgotPassword(email);
      
      if (response.data.success) {
        setNewPassword(response.data.newPassword);
        setUserEmail(response.data.email);
        setPasswordGenerated(true);
        setSuccess('Nouveau mot de passe généré avec succès !');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Aucun compte trouvé avec cet email');
      } else {
        setError('Erreur lors de la génération du mot de passe');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Masquer après 2 secondes
    }).catch(() => {
      setError('Erreur lors de la copie du mot de passe');
    });
  };

  if (passwordGenerated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto card p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-green-600 text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Mot de passe récupéré !</h1>
            <p className="text-gray-600">
              Voici votre nouveau mot de passe temporaire pour <strong>{userEmail}</strong>
            </p>
          </div>
          
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Votre nouveau mot de passe :
            </label>
            <div className="relative mb-3">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                readOnly
                className="w-full p-4 bg-white border-2 border-blue-300 rounded-md text-center font-mono text-xl font-bold text-blue-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              onClick={copyPassword}
              className={`btn w-full flex items-center justify-center transition-colors ${
                copySuccess 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FaCopy className="mr-2" />
              {copySuccess ? 'Copié !' : 'Copier le mot de passe'}
            </button>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Important :</strong> Notez bien ce mot de passe ! Vous pourrez le changer après connexion dans votre profil.
            </p>
          </div>
          
          <Link to="/login" className="btn btn-primary w-full">
            Se connecter maintenant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto card p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Mot de passe oublié</h1>
          <p className="text-gray-600">
            Entrez votre adresse email pour générer un nouveau mot de passe
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                  if (success) setSuccess('');
                }}
                className="input pl-10"
                placeholder="Entrez votre adresse email"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <FaEnvelope className="mr-2" />
                Générer un nouveau mot de passe
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-600 hover:underline flex items-center justify-center">
            <FaArrowLeft className="mr-2" /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;