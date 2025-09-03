import React, { useState, useRef, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { ICONS } from '../constants';
import { Product } from '../types';
import { useGetMyShop } from '../hooks/useGetMyShop';
import { useUpdateShop } from '../hooks/useUpdateShop';
import { useCreateShop } from '../hooks/useCreateShop';
import { useGetMyProducts } from '../hooks/useGetMyProducts';
import { useCreateProduct } from '../hooks/useCreateProduct';

const PRODUCT_CATEGORIES = ['Сельхозтехника', 'Запчасти', 'СЗР и Удобрения', 'Оборудование', 'Сельхозпродукция'];

// --- Отдельный компонент для создания магазина ---
// Он будет показан, только если магазин еще не существует.
const CreateShopForm: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { mutate: createShop, isPending } = useCreateShop();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createShop({
            name,
            description,
            logoUrl: 'https://i.ibb.co/6NDb3hK/default-shop-logo.png', // Временная заглушка для лого
            rating: 0 // Рейтинг по умолчанию
        });
    };

    return (
        <div className="p-4">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Магазин не найден</h1>
                <p className="text-gray-600 mb-6">Похоже, у вас еще нет магазина. Давайте создадим его!</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Название магазина"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                    <textarea
                        placeholder="Краткое описание вашего магазина"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                        required
                    />
                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                        {isPending ? 'Создание...' : 'Создать магазин'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- Основной компонент страницы ---
const MyShop: React.FC = () => {
    // --- Получение реальных данных ---
    const { data: myShop, isLoading: isLoadingShop, isError } = useGetMyShop();
    const { data: myProducts, isLoading: isLoadingProducts } = useGetMyProducts(myShop?.id);
    const { mutate: updateShop } = useUpdateShop();
    const { mutate: createProduct } = useCreateProduct();

    // --- Состояния для UI ---
    const [isManageToolsOpen, setIsManageToolsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // --- Состояния для формы редактирования магазина ---
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedLogoPreview, setEditedLogoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // --- Состояния для формы добавления товара ---
    const [productName, setProductName] = useState('');
    const [productCategory, setProductCategory] = useState(PRODUCT_CATEGORIES[0]);
    const [productPrice, setProductPrice] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [productIsNew, setProductIsNew] = useState(true);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const manualImageInputRef = useRef<HTMLInputElement>(null);

    // --- Эффект для заполнения полей формы редактирования, когда данные магазина загружены ---
    useEffect(() => {
        if (myShop) {
            setEditedName(myShop.name);
            setEditedDescription(myShop.description);
            setEditedLogoPreview(myShop.logoUrl);
        }
    }, [myShop]);

    // --- Обработчик обновления магазина ---
    const handleShopUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!myShop) return;
        updateShop({
            shopId: myShop.id,
            shopData: { 
                name: editedName, 
                description: editedDescription 
                // ПРИМЕЧАНИЕ: Загрузка файлов (логотипа) - более сложная задача.
                // Пока мы обновляем только текстовые данные.
            }
        });
        closeEditModal();
    };

    // --- Обработчик создания товара ---
    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !productPrice || !productQuantity || !myShop) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }

        createProduct({
            name: productName,
            category: productCategory,
            price: productPrice,
            quantity: parseInt(productQuantity, 10),
            isNew: productIsNew,
            imageUrl: productImagePreview || 'https://i.ibb.co/VMyPzCF/default-product-image.png', // Заглушка
            shopId: myShop.id,
        });

        // Сброс формы
        setProductName('');
        setProductCategory(PRODUCT_CATEGORIES[0]);
        setProductPrice('');
        setProductQuantity('');
        setProductIsNew(true);
        setProductImagePreview(null);
        if (manualImageInputRef.current) manualImageInputRef.current.value = "";
    };

    // --- Вспомогательные функции для UI ---
    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => setIsEditModalOpen(false);

    const handleProductImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (productImagePreview) URL.revokeObjectURL(productImagePreview);
            setProductImagePreview(URL.createObjectURL(file));
        }
    };

    // --- Условный рендеринг страницы ---
    if (isLoadingShop) {
        return <div className="text-center p-10">Загрузка данных магазина...</div>;
    }

    if (isError) {
        // Если запрос на получение магазина вернул ошибку (например, 404),
        // это значит, что магазина нет. Показываем форму создания.
        return <CreateShopForm />;
    }

    // --- Основная разметка, если магазин существует ---
    return (
        <div className="p-4 space-y-6">
            {myShop && (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-start gap-4">
                            <img src={myShop.logoUrl} alt={`${myShop.name} logo`} className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
                            <div className="flex-grow">
                                <h1 className="text-2xl font-bold text-gray-800">{myShop.name}</h1>
                                <p className="text-gray-600 mt-1">{myShop.description}</p>
                            </div>
                            <button onClick={openEditModal} className="text-gray-500 hover:text-blue-600 p-1 flex-shrink-0" aria-label="Редактировать магазин">
                                <ICONS.edit className="w-6 h-6" />
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
                        >
                            <span>Управление товарами</span>
                            <ICONS.chevronDown className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isManageToolsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`grid transition-all duration-500 ease-in-out ${isManageToolsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <div className="p-6 border-t border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Добавить товар вручную</h2>
                                    <form onSubmit={handleProductSubmit} className="space-y-4">
                                        <input type="text" placeholder="Название товара" value={productName} onChange={e => setProductName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="number" placeholder="Цена, ₽" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                                            <input type="number" placeholder="Количество, шт." value={productQuantity} onChange={e => setProductQuantity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                                        </div>
                                        <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                                            {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <select value={productIsNew ? 'new' : 'used'} onChange={e => setProductIsNew(e.target.value === 'new')} className="w-full p-2 border border-gray-300 rounded-md">
                                            <option value="new">Новый</option>
                                            <option value="used">Б/У</option>
                                        </select>
                                        <input type="file" ref={manualImageInputRef} onChange={handleProductImageSelect} className="hidden" accept="image/*" />
                                        <button type="button" onClick={() => manualImageInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2">
                                            <ICONS.image className="w-6 h-6" />
                                            <span>{productImagePreview ? 'Изменить фото' : 'Выбрать фото'}</span>
                                        </button>
                                        {productImagePreview && <img src={productImagePreview} alt="Предпросмотр" className="mt-2 rounded-md max-h-40 w-auto mx-auto" />}
                                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition-colors">Добавить товар</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Мои товары ({myProducts?.length || 0})</h2>
                        {isLoadingProducts ? (
                             <p className="text-center text-gray-500 py-8">Загрузка товаров...</p>
                        ) : myProducts && myProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {myProducts.map(product => (
                                    <ProductCard key={product.id} product={product} shop={myShop} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">У вас пока нет товаров. Добавьте первый!</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyShop;