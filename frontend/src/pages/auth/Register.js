import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { nom, email, mot_de_passe, confirmPassword } = formData;
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (!nom || !email || !mot_de_passe || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (mot_de_passe !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    const userData = {
      nom,
      email,
      mot_de_passe
    };
    
    const result = await register(userData);
    
    if (!result) {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      setIsLoading(false);
    } else {
      setSuccess('Inscription réussie ! Redirection...');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto card p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Inscription</h1>
          <p className="text-gray-600">Créez votre compte pour signaler des problèmes urbains</p>
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
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="nom">
              Nom complet
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={nom}
              onChange={onChange}
              className="input"
              placeholder="Entrez votre nom complet"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="input"
              placeholder="Entrez votre email"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="mot_de_passe">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="mot_de_passe"
                name="mot_de_passe"
                value={mot_de_passe}
                onChange={onChange}
                className="input pr-10"
                placeholder="Entrez votre mot de passe"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 6 caractères
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                className="input pr-10"
                placeholder="Confirmez votre mot de passe"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <FaUserPlus className="mr-2" />
            )}
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;