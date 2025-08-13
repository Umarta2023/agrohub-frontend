
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useMockData from '../hooks/useMockData';
import { ICONS } from '../constants';

const ServiceRequest: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const { services, serviceProviders, loading, addServiceRequest } = useMockData();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const service = services.find(s => s.id === serviceId);
    const provider = service ? serviceProviders.find(p => p.id === service.providerId) : undefined;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !service || !provider) {
            alert('Пожалуйста, укажите ваше имя и телефон.');
            return;
        }

        addServiceRequest({
            serviceId: service.id,
            providerId: provider.id,
            userName: name,
            userPhone: phone,
            notes: notes,
        });
        
        setIsSubmitted(true);
    };

    useEffect(() => {
        if (isSubmitted) {
            const timer = setTimeout(() => {
                navigate('/services');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSubmitted, navigate]);

    if (loading) {
        return <div className="text-center p-10">Загрузка...</div>;
    }

    if (!service || !provider) {
        return <div className="text-center p-10 text-red-500">Услуга не найдена.</div>;
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <ICONS.checkCircle className="w-20 h-20 text-green-500 mb-4 animate-scale-in" />
                <h1 className="text-2xl font-bold text-gray-800">Заявка отправлена!</h1>
                <p className="text-gray-600 mt-2">Представитель компании "{provider.name}" свяжется с вами в ближайшее время.</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <Link to="/services" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Заявка на услугу</h1>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="flex items-center gap-4">
                    <img src={service.imageUrl} alt={service.name} className="w-24 h-16 rounded-lg object-cover" />
                    <div className="flex-grow">
                        <h2 className="text-lg font-bold text-gray-800">{service.name}</h2>
                        <p className="text-sm text-gray-600">Исполнитель: <span className="font-semibold">{provider.name}</span></p>
                    </div>
                </div>
            </div>
          
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Заполните ваши данные</h2>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ваше имя</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Контактный телефон</label>
                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 999-99-99" className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Описание задачи (необязательно)</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Например, укажите модель техники или площадь поля..." className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Отправить заявку
                </button>
            </form>
        </div>
    );
};

export default ServiceRequest;
