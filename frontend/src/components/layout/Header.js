import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt, FaBell, FaTachometerAlt, FaClipboardList, FaChevronDown } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/api';
import logo from '../../assets/logo.png';

const Header = () => {
  const authContext = useContext(AuthContext);
  const { user, logout, isAdmin } = authContext || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const userMenuRef = useRef(null);

  const fetchNotificationCount = useCallback(async () => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    try {
      setIsLoadingNotifications(true);
      const res = await api.get('/notifications/unread-count');
      setNotificationCount(res.data.data.count || 0);
    } catch (error) {
      setNotificationCount(prev => prev === 0 ? 0 : prev);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    } else {
      setNotificationCount(0);
    }
  }, [user, fetchNotificationCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleUserMenuClick = (action) => {
    setIsUserMenuOpen(false);
    if (action === 'logout') {
      logout();
    }
  };

  const handleNotificationClick = () => {
    setNotificationCount(0);
    setTimeout(fetchNotificationCount, 2000);
  };

  const hasAdminAccess = user && isAdmin && typeof isAdmin === 'function' && isAdmin();

  const formatNotificationCount = (count) => {
    if (count === 0) return null;
    if (count > 99) return '99+';
    return count.toString();
  };

  return (
    <header className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logo} 
              alt="MogaAlert Logo" 
              className="h-10"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="text-2xl font-bold text-primary-600">MogaAlert</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Accueil
            </Link>
            <Link to="/signalements" className="text-gray-700 hover:text-primary-600 transition-colors">
              Signalements
            </Link>
            <Link to="/a-propos" className="text-gray-700 hover:text-primary-600 transition-colors">
              À Propos
            </Link>
            
            {!user ? (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-primary flex items-center">
                  <FaSignInAlt className="mr-2" /> Connexion
                </Link>
                <Link to="/register" className="btn btn-secondary flex items-center">
                  <FaUserPlus className="mr-2" /> Inscription
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {hasAdminAccess && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                    <FaTachometerAlt className="inline mr-1" /> Dashboard
                  </Link>
                )}
                
                <Link 
                  to="/notifications" 
                  className="relative text-gray-700 hover:text-primary-600 transition-colors group"
                  onClick={handleNotificationClick}
                  title={`${notificationCount} notification${notificationCount > 1 ? 's' : ''} non lue${notificationCount > 1 ? 's' : ''}`}
                >
                  <FaBell className={`text-xl transition-all duration-200 ${notificationCount > 0 ? 'text-primary-600' : ''} group-hover:scale-110`} />
                  {notificationCount > 0 && (
                    <span className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-bold animate-pulse transition-all duration-200 ${isLoadingNotifications ? 'opacity-50' : ''}`}>
                      {formatNotificationCount(notificationCount)}
                    </span>
                  )}
                  {isLoadingNotifications && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></span>
                  )}
                </Link>
                
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-3 py-2 border border-transparent hover:border-gray-200"
                  >
                    <FaUser className="mr-2" /> 
                    <span className="hidden sm:inline">{user.nom}</span>
                    <FaChevronDown className={`ml-2 text-sm transform transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.nom}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          onClick={() => handleUserMenuClick('profile')}
                        >
                          <FaUser className="mr-3 text-gray-400" />
                          Mon Profil
                        </Link>
                        <Link 
                          to="/mes-signalements" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          onClick={() => handleUserMenuClick('signalements')}
                        >
                          <FaClipboardList className="mr-3 text-gray-400" />
                          Mes Signalements
                        </Link>
                      </div>
                      
                      <hr className="my-1 border-gray-200" />
                      
                      <div className="py-1">
                        <button
                          onClick={() => handleUserMenuClick('logout')}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <FaSignOutAlt className="mr-3 text-red-400" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>

          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
          >
            {isMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={toggleMenu}>
                Accueil
              </Link>
              <Link to="/signalements" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={toggleMenu}>
                Signalements
              </Link>
              <Link to="/a-propos" className="text-gray-700 hover:text-primary-600 transition-colors" onClick={toggleMenu}>
                À Propos
              </Link>
              
              {!user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link to="/login" className="btn btn-primary flex items-center justify-center" onClick={toggleMenu}>
                    <FaSignInAlt className="mr-2" /> Connexion
                  </Link>
                  <Link to="/register" className="btn btn-secondary flex items-center justify-center" onClick={toggleMenu}>
                    <FaUserPlus className="mr-2" /> Inscription
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{user.nom}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  {hasAdminAccess && (
                    <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors" onClick={toggleMenu}>
                      <FaTachometerAlt className="mr-2" /> Dashboard
                    </Link>
                  )}
                  
                  <Link 
                    to="/notifications" 
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors justify-between" 
                    onClick={() => {
                      handleNotificationClick();
                      toggleMenu();
                    }}
                  >
                    <div className="flex items-center">
                      <FaBell className="mr-2" /> Notifications
                    </div>
                    {notificationCount > 0 && (
                      <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                        {formatNotificationCount(notificationCount)}
                      </span>
                    )}
                  </Link>
                  
                  <Link to="/profile" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors" onClick={toggleMenu}>
                    <FaUser className="mr-2" /> Mon Profil
                  </Link>
                  <Link to="/mes-signalements" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors" onClick={toggleMenu}>
                    <FaClipboardList className="mr-2" /> Mes Signalements
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    className="btn btn-danger flex items-center justify-center mt-2"
                  >
                    <FaSignOutAlt className="mr-2" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .group:hover .animate-pulse {
          animation: none;
        }
      `}</style>
    </header>
  );
};

export default Header;