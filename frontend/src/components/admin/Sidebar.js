import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaClipboardList, 
  FaTags, 
  FaCogs,
  FaChartBar,
  FaSignOutAlt,
  FaArchive,
  FaComment
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    {
      path: '/dashboard',
      icon: <FaTachometerAlt />,
      title: 'Tableau de bord',
      exact: true
    },
    {
      path: '/dashboard/signalements',
      icon: <FaClipboardList />,
      title: 'Signalements'
    },
    {
      path: '/dashboard/commentaires',
      icon: <FaComment />,
      title: 'Commentaires'
    },
    {
      path: '/dashboard/utilisateurs',
      icon: <FaUsers />,
      title: 'Utilisateurs'
    },
    {
      path: '/dashboard/categories',
      icon: <FaTags />,
      title: 'Catégories'
    },
    {
      path: '/dashboard/services',
      icon: <FaCogs />,
      title: 'Services'
    },
    {
      path: '/dashboard/archives',
      icon: <FaArchive />,
      title: 'Archives'
    },
    {
      path: '/dashboard/statistiques',
      icon: <FaChartBar />,
      title: 'Statistiques'
    }
  ];
  
  return (
    <div className="bg-gray-800 text-white w-64 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-5 border-b border-gray-700">
        <Link to="/" className="text-xl font-bold">MogaAlert</Link>
        <div className="text-gray-400 text-sm">Administration</div>
      </div>
      
      <nav className="mt-5">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-5 py-3 transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="px-5 py-3 mt-auto border-t border-gray-700">
        <Link to="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <FaSignOutAlt className="mr-3" /> Retour au site
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;