import React from 'react';
import { Zap } from 'lucide-react';

const Logo = ({ size = 32, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Zap className="text-blue-600" size={size} />
      <span className="text-xl font-bold text-gray-800">FilaZero</span>
    </div>
  );
};

export default Logo;

