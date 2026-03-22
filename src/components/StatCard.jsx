import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const StatCard = ({ label, value, unit = '%', trend, description }) => {
  const getTrendIcon = () => {
    if (trend > 0) return <FaArrowUp className="text-red-600 animate-pulse" />;
    if (trend < 0) return <FaArrowDown className="text-slate-400" />;
    return <FaMinus className="text-slate-300" />;
  };

  const getStatusColor = () => {
    if (label.toLowerCase().includes('lạm phát')) {
      if (value > 10) return 'text-red-700';
      if (value > 5) return 'text-red-500';
      return 'text-slate-800';
    }
    if (label.toLowerCase().includes('thất nghiệp')) {
      if (value > 8) return 'text-red-700';
      if (value > 5) return 'text-red-500';
      return 'text-slate-800';
    }
    if (label.toLowerCase().includes('tăng trưởng')) {
      if (value < 1) return 'text-red-700';
      if (value < 3) return 'text-red-500';
      return 'text-slate-800';
    }
    if (label.toLowerCase().includes('lòng dân') || label.toLowerCase().includes('hài lòng')) {
      if (value < 30) return 'text-red-700';
      if (value < 50) return 'text-red-500';
      return 'text-slate-800';
    }
    return 'text-slate-900';
  };

  return (
    <div className="bg-[#F5F5F5] border-2 border-slate-900 p-5 relative overflow-hidden group hover:bg-white transition-colors">
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-slate-900 clip-path-triangle translate-x-4 -translate-y-4 group-hover:bg-red-600 transition-colors" />
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</h3>
        <div className="text-xs">
          {getTrendIcon()}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-black tracking-tighter ${getStatusColor()}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="w-full bg-slate-200 h-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${value > 0 ? 'bg-red-600' : 'bg-slate-400'}`}
            style={{ width: `${Math.min(Math.max(value * 5, 0), 100)}%` }} 
          />
        </div>
        <p className="text-[10px] leading-tight text-slate-400 font-medium uppercase tracking-wider">
          {description}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
