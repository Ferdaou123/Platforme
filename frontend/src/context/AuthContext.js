import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await api.get('/auth/me');
          console.log('✅ Utilisateur chargé:', res.data.data);
          setUser(res.data.data);
        } catch (err) {
          console.error('❌ Erreur lors du chargement de l\'utilisateur:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        toast.success('Inscription réussie');
        navigate('/');
        return true;
      }
    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
      return false;
    }
  };

  const login = async (userData) => {
    try {
      const res = await api.post('/auth/login', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        toast.success('Connexion réussie');
        navigate('/');
        return true;
      }
    } catch (err) {
      console.error('❌ Erreur connexion:', err);
      toast.error(err.response?.data?.error || 'Identifiants invalides');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Erreur lors de la déconnexion', err);
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    toast.info('Vous êtes déconnecté');
    navigate('/login');
  };

  const isAdmin = () => {
    return user && user.rôle === 'admin';
  };

  const isCitoyen = () => {
    return user && user.rôle === 'citoyen';
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/auth/updatedetails', userData);
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profil mis à jour avec succès');
        return true;
      }
    } catch (err) {
      console.error('❌ Erreur mise à jour profil:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
      return false;
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const res = await api.put('/auth/updatepassword', passwordData);
      if (res.data.success) {
        toast.success('Mot de passe mis à jour avec succès');
        return true;
      }
    } catch (err) {
      console.error('❌ Erreur mise à jour mot de passe:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe');
      return false;
    }
  };

  console.log('🔍 AuthContext état:', {
    user: user?.nom,
    rôle: user?.rôle,
    isLoading,
    hasToken: !!token
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        register,
        login,
        logout,
        isAdmin,
        isCitoyen,
        isAuthenticated,
        updateProfile,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;