
import React from 'react';
import type { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
}

const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex transform hover:-translate-y-1 transition-all duration-300">
      <img src={ad.imageUrl} alt={ad.title} className="w-1/3 h-full object-cover"/>
      <div className="p-4 flex flex-col justify-between w-2/3">
        <div>
          <p className="text-sm text-gray-500">{ad.category}</p>
          <h3 className="text-md font-bold text-gray-800 mt-1">{ad.title}</h3>
          <p className="text-lg font-extrabold text-green-600 mt-2">{ad.price}</p>
          <p className="text-sm text-gray-600 mt-1">Объем: {ad.volume}</p>
          <p className="text-sm text-gray-600">Место: {ad.location}</p>
        </div>
        <button className="w-full mt-3 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
          Связаться
        </button>
      </div>
    </div>
  );
};

export default AdCard;