
import React, { useState, useRef } from 'react';
import useMockData from '../hooks/useMockData';
import ServiceCard from '../components/ServiceCard';
import { ICONS } from '../constants';
import { Service } from '../types';

// Hardcode the current user's provider ID for this prototype
const MY_PROVIDER_ID = 'sp1'; 
const SERVICE_CATEGORIES = ['Ремонт техники', 'Агро-консультации', 'Транспорт', 'Обработка полей'];

const MyServices: React.FC = () => {
    const { serviceProviders, services, addServiceManually, updateServiceProviderDetails, loading } = useMockData();
    const myProvider = serviceProviders.find(p => p.id === MY_PROVIDER_ID);
    const myServices = services.filter(s => s.providerId === MY_PROVIDER_ID);

    const [isManageToolsOpen, setIsManageToolsOpen] = useState(false);

    // Manual form state
    const [name, setName] = useState('');
    const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const manualImageInputRef = useRef<HTMLInputElement>(null);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedLogoPreview, setEditedLogoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleManualImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !imagePreview) {
            alert('Пожалуйста, заполните все поля и выберите фото.');
            return;
        }

        const newService: Omit<Service, 'id' | 'providerId'> = {
            name,
            category,
            description,
            imageUrl: imagePreview,
        };

        addServiceManually(newService, MY_PROVIDER_ID);

        // Reset form
        setName('');
        setCategory(SERVICE_CATEGORIES[0]);
        setDescription('');
        setImagePreview(null);
        if(manualImageInputRef.current) manualImageInputRef.current.value = "";
    };

    const openEditModal = () => {
        if (!myProvider) return;
        setEditedName(myProvider.name);
        setEditedDescription(myProvider.description);
        setEditedLogoPreview(myProvider.logoUrl);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        if (editedLogoPreview && editedLogoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(editedLogoPreview);
        }
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const newPreviewUrl = URL.createObjectURL(file);
            if (editedLogoPreview && editedLogoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(editedLogoPreview);
            }
            setEditedLogoPreview(newPreviewUrl);
        }
    };

    const handleProviderUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!myProvider) return;
        updateServiceProviderDetails(myProvider.id, {
            name: editedName,
            description: editedDescription,
            logoUrl: editedLogoPreview || myProvider.logoUrl,
        });
        closeEditModal();
    };

    if (loading) {
        return <div className="text-center p-10">Загрузка данных компании...</div>;
    }

    if (!myProvider) {
        return <div className="text-center p-10 text-red-500">Ошибка: Компания не найдена.</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                    <img src={myProvider.logoUrl} alt={`${myProvider.name} logo`} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500" />
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold text-gray-800">{myProvider.name}</h1>
                        <p className="text-gray-600 mt-1">{myProvider.description}</p>
                    </div>
                    <button onClick={openEditModal} className="text-gray-500 hover:text-indigo-600 p-1 flex-shrink-0">
                        <ICONS.edit className="w-6 h-6"/>
                    </button>
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Редактировать компанию</h2>
                        <form onSubmit={handleProviderUpdate} className="space-y-4">
                            <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                            <textarea value={editedDescription} onChange={e => setEditedDescription(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-md" required />
                            <div className="flex items-center gap-4">
                                <img src={editedLogoPreview || ''} alt="Предпросмотр лого" className="w-16 h-16 rounded-full object-cover border"/>
                                <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                                <button type="button" onClick={() => logoInputRef.current?.click()} className="text-indigo-600 font-semibold hover:underline">Изменить лого</button>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button onClick={() => setIsManageToolsOpen(p => !p)} className="w-full flex justify-between items-center p-4 font-bold text-lg text-gray-800 hover:bg-gray-50">
                    <span>Управление услугами</span>
                    <ICONS.chevronDown className={`w-6 h-6 text-gray-600 transition-transform ${isManageToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isManageToolsOpen && (
                    <div className="p-6 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Добавить услугу вручную</h2>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <input type="text" placeholder="Название услуги" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md" required />
                            <textarea placeholder="Описание услуги" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-md" required />
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-md">
                                {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input type="file" ref={manualImageInputRef} onChange={handleManualImageSelect} className="hidden" accept="image/*" />
                            <button type="button" onClick={() => manualImageInputRef.current?.click()} className="w-full border-2 border-dashed rounded-md p-4 text-center text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2">
                                <ICONS.image className="w-6 h-6"/>
                                <span>{imagePreview ? 'Изменить фото' : 'Выбрать фото'}</span>
                            </button>
                            {imagePreview && <img src={imagePreview} alt="Предпросмотр" className="mt-2 rounded-md max-h-40 w-auto mx-auto"/>}
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700">Добавить услугу</button>
                        </form>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Мои услуги ({myServices.length})</h2>
                {myServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myServices.map(service => (
                            <ServiceCard key={service.id} service={service} provider={myProvider} />
                        ))}
                    </div>
                ) : (
                     <p className="text-center text-gray-500 py-8">У вас пока нет добавленных услуг.</p>
                )}
            </div>
        </div>
    );
};

export default MyServices;