import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetFields } from '../hooks/useGetFields'; // <-- 1. Новый хук
import { ICONS } from '../constants';

const getFieldWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'полей';
    }
    if (lastDigit === 1) {
        return 'поле';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'поля';
    }
    return 'полей';
};

const MyFields: React.FC = () => {
    // --- 2. Получаем реальные данные с сервера ---
    const { data: fields = [], isLoading } = useGetFields();

    const analytics = useMemo(() => {
        if (!fields || fields.length === 0) {
            return { totalFields: 0, totalArea: 0, cropStructure: [] };
        }

        const totalArea = fields.reduce((acc, field) => acc + field.area, 0);
        
        const sownFields = fields.filter(f => f.currentCrop.toLowerCase() !== 'пар');
        const totalSownArea = sownFields.reduce((acc, field) => acc + field.area, 0);

        const cropData = sownFields.reduce((acc, field) => {
            const crop = field.currentCrop;
            if (!acc[crop]) {
                acc[crop] = { totalArea: 0, count: 0 };
            }
            acc[crop].totalArea += field.area;
            acc[crop].count += 1;
            return acc;
        }, {} as Record<string, { totalArea: number; count: number }>);

        const cropStructure = Object.entries(cropData)
            .map(([crop, data]) => ({
                crop, ...data,
                percentage: totalSownArea > 0 ? (data.totalArea / totalSownArea) * 100 : 0
            }))
            .sort((a, b) => b.totalArea - a.totalArea);

        return {
            totalFields: fields.length,
            totalArea: parseFloat(totalArea.toFixed(2)),
            cropStructure
        };
    }, [fields]);

    // --- 3. Обработка загрузки ---
    if (isLoading) {
        return <div className="text-center p-10">Загрузка полей...</div>;
    }

    // --- 4. Основная разметка (без изменений) ---
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                 <div className="flex items-center">
                    <Link to="/info" className="p-2 rounded-full hover:bg-gray-200">
                        <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 ml-2">Мои поля</h1>
                </div>
                <Link to="/add-field" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <ICONS.plus className="w-5 h-5"/>
                    <span>Добавить</span>
                </Link>
            </div>
            
            {fields.length > 0 ? (
                 <>
                    {/* Analytics Dashboard */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-md text-center">
                                <p className="text-sm text-gray-500">Всего полей</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{analytics.totalFields}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-md text-center">
                                <p className="text-sm text-gray-500">Общая площадь</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{analytics.totalArea.toLocaleString('ru-RU')} <span className="text-xl font-medium">га</span></p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Структура посевов</h2>
                            <div className="space-y-4">
                                {analytics.cropStructure.length > 0 ? analytics.cropStructure.map(item => (
                                    <div key={item.crop}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-semibold text-gray-700">{item.crop} <span className="text-gray-500 font-normal">({item.percentage.toFixed(1)}%)</span></span>
                                            <span className="text-sm text-gray-500">{item.totalArea.toLocaleString('ru-RU')} га ({item.count} {getFieldWord(item.count)})</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5" title={`${item.percentage.toFixed(1)}%`}>
                                            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-4">Нет данных о посевах.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Field List */}
                    <h2 className="text-lg font-bold text-gray-800 px-2 pt-2">Список полей</h2>
                    <div className="space-y-4">
                        {fields.map(field => (
                            <Link to={`/field/${field.id}`} key={field.id} className="block bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center gap-4">
                                    <img src={field.imageUrl} alt={field.name} className="w-24 h-16 rounded-lg object-cover" />
                                    <div className="flex-grow">
                                        <h2 className="text-lg font-bold text-gray-800">{field.name}</h2>
                                        <p className="text-sm text-gray-600">{field.area.toLocaleString('ru-RU')} га</p>
                                        <p className="text-sm text-gray-500 mt-1">Культура: <span className="font-semibold text-gray-700">{field.currentCrop}</span></p>
                                    </div>
                                    <ICONS.chevronDown className="w-6 h-6 text-gray-400 -rotate-90" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">У вас пока нет добавленных полей.</p>
                    <Link to="/add-field" className="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Добавить первое поле
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyFields;