import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const StatCard = ({ label, value, unit = '%', trend, description }) => {
  const getTrendIcon = () => {
    if (trend > 0) return <FaArrowUp className="text-red-500 animate-bounce" />;
    if (trend < 0) return <FaArrowDown className="text-green-500 animate-bounce" />;
    return <FaMinus className="text-gray-400" />;
  };

  const getStatusColor = () => {
    // Logic specific to economic health (e.g., high inflation is usually bad)
    if (label.toLowerCase().includes('lạm phát')) {
      if (value > 5) return 'text-red-600';
      if (value > 3) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (label.toLowerCase().includes('thất nghiệp')) {
      if (value > 6) return 'text-red-600';
      if (value > 4) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (label.toLowerCase().includes('tăng trưởng')) {
      if (value < 2) return 'text-red-600';
      if (value < 4) return 'text-yellow-600';
      return 'text-green-600';
    }
    return 'text-gray-900';
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 transition-all hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{label}</h3>
        {getTrendIcon()}
      </div>
      <div className="flex items-baseline space-x-1">
        <span className={`text-4xl font-bold tracking-tight ${getStatusColor()}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xl font-medium text-gray-400">{unit}</span>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${getStatusColor().replace('text', 'bg')}`}
            style={{ width: `${Math.min(Math.max(value * 5, 0), 100)}%` }} 
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500 italic leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default StatCard;
