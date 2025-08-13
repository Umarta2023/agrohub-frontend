
import React, { useState, useRef } from 'react';
import useMockData from '../hooks/useMockData';
import ProductCard from '../components/ProductCard';
import { ICONS } from '../constants';
import { Product } from '../types';

// Hardcode the current user's shop ID for this prototype
const MY_SHOP_ID = 'shop1'; 
const PRODUCT_CATEGORIES = ['Сельхозтехника', 'Запчасти', 'СЗР и Удобрения', 'Оборудование', 'Сельхозпродукция'];

const MyShop: React.FC = () => {
    const { shops, products, addProductsFromPricelist, addProductManually, updateShopDetails, loading } = useMockData();
    const myShop = shops.find(s => s.id === MY_SHOP_ID);
    const myProducts = products.filter(p => p.shopId === MY_SHOP_ID);

    // State for management tools accordion
    const [isManageToolsOpen, setIsManageToolsOpen] = useState(false);

    // State for file upload
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for manual form
    const [name, setName] = useState('');
    const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isNew, setIsNew] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const manualImageInputRef = useRef<HTMLInputElement>(null);

    // State for edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedLogoPreview, setEditedLogoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);


    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            setUploadMessage('Обработка файла...');
            
            setTimeout(() => {
                const count = addProductsFromPricelist(MY_SHOP_ID);
                setUploadMessage(`✅ Прайс-лист успешно обработан. Добавлено ${count} новых товара.`);
                setIsUploading(false);
                setTimeout(() => setUploadMessage(''), 4000);
            }, 2000);
        }
    };
    
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleManualImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !quantity || !imagePreview) {
            alert('Пожалуйста, заполните все поля и выберите фото.');
            return;
        }

        const newProduct: Omit<Product, 'id' | 'shopId'> = {
            name,
            category,
            price: `${price} ₽`,
            quantity: parseInt(quantity, 10),
            isNew,
            imageUrl: imagePreview,
        };

        addProductManually(newProduct, MY_SHOP_ID);

        // Reset form
        setName('');
        setCategory(PRODUCT_CATEGORIES[0]);
        setPrice('');
        setQuantity('');
        setIsNew(true);
        setImagePreview(null);
        if(manualImageInputRef.current) manualImageInputRef.current.value = "";
    };

    // --- Edit Modal Logic ---
    const openEditModal = () => {
        if (!myShop) return;
        setEditedName(myShop.name);
        setEditedDescription(myShop.description);
        setEditedLogoPreview(myShop.logoUrl);
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

    const handleShopUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!myShop) return;
        updateShopDetails(myShop.id, {
            name: editedName,
            description: editedDescription,
            logoUrl: editedLogoPreview || myShop.logoUrl,
        });
        closeEditModal();
    };


    if (loading) {
        return <div className="text-center p-10">Загрузка данных магазина...</div>;
    }

    if (!myShop) {
        return <div className="text-center p-10 text-red-500">Ошибка: Магазин не найден.</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                    <img src={myShop.logoUrl} alt={`${myShop.name} logo`} className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold text-gray-800">{myShop.name}</h1>
                        <p className="text-gray-600 mt-1">{myShop.description}</p>
                    </div>
                    <button onClick={openEditModal} className="text-gray-500 hover:text-blue-600 p-1 flex-shrink-0" aria-label="Редактировать магазин">
                        <ICONS.edit className="w-6 h-6"/>
                    </button>
                </div>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Редактировать магазин</h2>
                        <form onSubmit={handleShopUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Название магазина</label>
                                <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700">Описание</label>
                                <textarea value={editedDescription} onChange={e => setEditedDescription(e.target.value)} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Логотип</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <img src={editedLogoPreview || ''} alt="Предпросмотр логотипа" className="w-16 h-16 rounded-full object-cover border"/>
                                    <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                                    <button type="button" onClick={() => logoInputRef.current?.click()} className="text-blue-600 font-semibold hover:underline">Изменить лого</button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Отмена</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                    onClick={() => setIsManageToolsOpen(prev => !prev)}
                    className="w-full flex justify-between items-center p-4 font-bold text-lg text-gray-800 hover:bg-gray-50 transition-colors"
                    aria-expanded={isManageToolsOpen}
                    aria-controls="manage-tools-panel"
                >
                    <span>Управление товарами</span>
                    <ICONS.chevronDown className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isManageToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                    id="manage-tools-panel"
                    className={`grid transition-all duration-500 ease-in-out ${isManageToolsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                    <div className="overflow-hidden">
                        <div className="p-6 border-t border-gray-200 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Загрузка прайс-листа</h2>
                                <p className="text-gray-600 text-sm mb-4">Для массового добавления товаров загрузите файл в формате CSV или Excel.</p>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                                <button onClick={triggerFileSelect} disabled={isUploading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">
                                    <ICONS.upload className="w-5 h-5"/>
                                    <span>{isUploading ? 'Обработка...' : 'Выбрать файл'}</span>
                                </button>
                                {uploadMessage && <p className="text-center text-sm text-gray-700 mt-3">{uploadMessage}</p>}
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Добавить товар вручную</h2>
                                <form onSubmit={handleManualSubmit} className="space-y-4">
                                    <input type="text" placeholder="Название товара" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="number" placeholder="Цена, ₽" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                                        <input type="number" placeholder="Количество, шт." value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                                    </div>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                                        {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <select value={isNew ? 'new' : 'used'} onChange={e => setIsNew(e.target.value === 'new')} className="w-full p-2 border border-gray-300 rounded-md">
                                        <option value="new">Новый</option>
                                        <option value="used">Б/У</option>
                                    </select>
                                    
                                    <input type="file" ref={manualImageInputRef} onChange={handleManualImageSelect} className="hidden" accept="image/*" />
                                    <button type="button" onClick={() => manualImageInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2">
                                        <ICONS.image className="w-6 h-6"/>
                                        <span>{imagePreview ? 'Изменить фото' : 'Выбрать фото'}</span>
                                    </button>

                                    {imagePreview && <img src={imagePreview} alt="Предпросмотр" className="mt-2 rounded-md max-h-40 w-auto mx-auto"/>}

                                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300">
                                        Добавить товар
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Мои товары ({myProducts.length})</h2>
                {myProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {myProducts.map(product => (
                            <ProductCard key={product.id} product={product} shop={myShop} />
                        ))}
                    </div>
                ) : (
                     <p className="text-center text-gray-500 py-8">У вас пока нет товаров.</p>
                )}
            </div>
        </div>
    );
};

export default MyShop;