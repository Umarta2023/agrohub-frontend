import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';
import type { ServiceRequestData, Service, ServiceProvider } from '../types';
import { useGetServiceRequests } from '../hooks/useGetServiceRequests';
import { useGetServices } from '../hooks/useGetServices';
import { useGetServiceProviders } from '../hooks/useGetServiceProviders';


const getStatusClass = (status: ServiceRequestData['status']) => {
    switch (status) {
        case 'Открыта': return 'bg-blue-100 text-blue-800';
        case 'В работе': return 'bg-yellow-100 text-yellow-800';
        case 'Выполнена': return 'bg-green-100 text-green-800';
        case 'Отклонена': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// --- 1. Изменяем RequestCard, чтобы он принимал все данные через пропсы ---
const RequestCard: React.FC<{ request: ServiceRequestData, services: Service[], serviceProviders: ServiceProvider[] }> = ({ request, services, serviceProviders }) => {
    // Данные теперь не загружаются здесь, а приходят сверху
    const service = services.find(s => s.id === request.serviceId);
    const provider = serviceProviders.find(p => p.id === request.providerId);

    if (!service || !provider) {
        return <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500">Заявка #{request.id} - связанные данные не найдены.</div>;
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-gray-800 text-md flex-1">{service.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusClass(request.status)} flex-shrink-0`}>{request.status}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Исполнитель: <span className="font-semibold">{provider.name}</span></p>
            <p className="text-sm text-gray-500 mt-2">Дата: {new Date(request.date).toLocaleDateString('ru-RU')}</p>
            {request.notes && <p className="text-sm bg-gray-50 p-2 mt-3 rounded-md border-l-2 border-gray-300">"{request.notes}"</p>}
        </div>
    );
};

const MyRequests: React.FC = () => {
    // --- 2. Загружаем все необходимые данные в родительском компоненте ---
    const { data: serviceRequests = [], isLoading: loadingRequests } = useGetServiceRequests();
    const { data: services = [], isLoading: loadingServices } = useGetServices();
    const { data: serviceProviders = [], isLoading: loadingProviders } = useGetServiceProviders();

    const isLoading = loadingRequests || loadingServices || loadingProviders;

    const activeRequests = serviceRequests.filter(r => r.status === 'Открыта' || r.status === 'В работе').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const archivedRequests = serviceRequests.filter(r => r.status === 'Выполнена' || r.status === 'Отклонена').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (isLoading) {
        return <div className="text-center p-10">Загрузка заявок...</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center mb-2">
                <Link to="/info" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Мои заявки</h1>
            </div>

            {serviceRequests.length === 0 ? (
                 <div className="text-center py-16">
                    <p className="text-gray-500">У вас пока нет заявок на услуги.</p>
                    <Link to="/services" className="mt-4 inline-block bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                        Найти услугу
                    </Link>
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 px-2 mb-3">Активные заявки</h2>
                        {activeRequests.length > 0 ? (
                            <div className="space-y-4">
                                {/* --- 3. Передаем загруженные данные в RequestCard --- */}
                                {activeRequests.map(req => <RequestCard key={req.id} request={req} services={services} serviceProviders={serviceProviders} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">Нет активных заявок.</p>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-800 px-2 mb-3">Архив</h2>
                        {archivedRequests.length > 0 ? (
                            <div className="space-y-4">
                                {archivedRequests.map(req => <RequestCard key={req.id} request={req} services={services} serviceProviders={serviceProviders} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">Архив пуст.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyRequests;