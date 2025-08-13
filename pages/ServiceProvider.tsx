
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useMockData from '../hooks/useMockData';
import ServiceCard from '../components/ServiceCard';

const ServiceProvider: React.FC = () => {
    const { providerId } = useParams<{ providerId: string }>();
    const { serviceProviders, services, loading } = useMockData();

    const provider = serviceProviders.find(p => p.id === providerId);
    const providerServices = services.filter(s => s.providerId === providerId);

    if (loading) {
        return <div className="text-center p-10">Загрузка данных компании...</div>;
    }

    if (!provider) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-red-500">Компания не найдена</h1>
                <Link to="/services" className="mt-4 inline-block text-blue-600 hover:underline">
                    Вернуться к услугам
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <div className="flex items-center gap-4 mb-4">
                     <img src={provider.logoUrl} alt={`${provider.name} logo`} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{provider.name}</h1>
                        <p className="text-gray-600 mt-1">{provider.description}</p>
                    </div>
                </div>
                <button className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Связаться с компанией
                </button>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Услуги компании</h2>
                {providerServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {providerServices.map(service => (
                            <ServiceCard key={service.id} service={service} provider={provider} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Эта компания пока не добавила услуги.</p>
                )}
            </div>
        </div>
    );
};

export default ServiceProvider;