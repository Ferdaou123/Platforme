import React from 'react';

const StatCard = ({ title, value, icon, color, footer }) => {
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-500">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`rounded-full p-3 ${getColorClass()}`}>
            {icon}
          </div>
        </div>
      </div>
      {footer && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600">{footer}</p>
        </div>
      )}
    </div>
  );
};

export default StatCard;