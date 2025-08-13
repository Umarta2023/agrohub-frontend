
import React from 'react';
import { Link } from 'react-router-dom';
import type { Service, ServiceProvider } from '../types';
import { ICONS } from '../constants';

interface ServiceCardProps {
  service: Service;
  provider: ServiceProvider | undefined;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, provider }) => {
  if (!provider) {
    return null; // Or a loading/error state
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
      <img src={service.imageUrl} alt={service.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <p className="text-sm text-gray-500">{service.category}</p>
        <h3 className="text-md font-bold text-gray-800 mt-1">{service.name}</h3>
        <p className="text-sm text-gray-600 mt-2 leading-snug">{service.description}</p>
        <div className="flex items-center justify-between mt-3">
            <div className="flex items-center text-sm text-gray-600">
                <Link to={`/provider/${provider.id}`} className="hover:underline font-semibold">
                    <span>{provider.name}</span>
                </Link>
                <ICONS.star className="w-4 h-4 text-yellow-400 ml-2 mr-1" />
                <span>{provider.rating}</span>
            </div>
            <Link to={`/request-service/${service.id}`} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm">
                Оставить заявку
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;