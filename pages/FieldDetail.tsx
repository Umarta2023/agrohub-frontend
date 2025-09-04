import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ICONS } from '../constants';
import { FieldOperationPayload, FieldOperation, CropHistory } from '../types';
import { useGetFieldById } from '../hooks/useGetFieldById';
import { useGetFieldOperations } from '../hooks/useGetFieldOperations';
import { useGetCropHistory } from '../hooks/useGetCropHistory';
import { useCreateFieldOperation } from '../hooks/useCreateFieldOperation';

// ... (Компоненты CollapsibleSection и FinancialAnalytics остаются без изменений) ...
declare const L: any;

const CollapsibleSection: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex justify-between items-center p-4 font-bold text-lg text-gray-800 hover:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-6 h-6 text-gray-700"/>
                    <span>{title}</span>
                </div>
                <ICONS.chevronDown className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-200">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinancialAnalytics: React.FC<{ operations: FieldOperation[], area: number }> = ({ operations, area }) => {
    
    const [plannedYield, setPlannedYield] = useState('50'); // c/ha
    const [plannedPrice, setPlannedPrice] = useState('13000'); // rub/tonne

    const analytics = useMemo(() => {
        const totalCost = operations.reduce((acc, op) => acc + (op.cost || 0), 0);
        const costPerHa = area > 0 ? totalCost / area : 0;
        
        const costStructure = operations.reduce((acc, op) => {
            let category = 'Прочее';
            const opType = op.type.toLowerCase();
            if (opType.includes('посев') || opType.includes('семена')) category = 'Семена';
            else if (opType.includes('удобр') || opType.includes('подкормка')) category = 'Удобрения';
            else if (opType.includes('гербицид') || opType.includes('инсектицид') || opType.includes('фунгицид')) category = 'СЗР';
            else if (opType.includes('вспашка') || opType.includes('дискование') || opType.includes('культивация')) category = 'Обработка почвы';
            else if (opType.includes('уборка')) category = 'Уборка';

            acc[category] = (acc[category] || 0) + (op.cost || 0);
            return acc;
        }, {} as Record<string, number>);

        const structureWithPercent = Object.entries(costStructure)
            .map(([category, cost]: [string, number]) => ({ // <-- ИЗМЕНЕНИЕ ЗДЕСЬ
                category,
                cost,
                percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
            }))
            .sort((a, b) => b.cost - a.cost);

        const numYield = parseFloat(plannedYield);
        const numPrice = parseFloat(plannedPrice);
        
        let revenuePerHa = 0, profitPerHa = 0, totalRevenue = 0, totalProfit = 0;
        if (!isNaN(numYield) && !isNaN(numPrice) && area > 0) {
            revenuePerHa = (numYield / 10) * numPrice;
            profitPerHa = revenuePerHa - costPerHa;
            totalRevenue = revenuePerHa * area;
            totalProfit = profitPerHa * area;
        }

        return { totalCost, costPerHa, structureWithPercent, revenuePerHa, profitPerHa, totalRevenue, totalProfit }
    }, [operations, area, plannedYield, plannedPrice]);

    const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700">Общие затраты</p>
                    <p className="text-xl font-bold text-red-600">{analytics.totalCost.toLocaleString('ru-RU')} ₽</p>
                </div>
                 <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700">Затраты на гектар</p>
                    <p className="text-xl font-bold text-red-600">{analytics.costPerHa.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽/га</p>
                </div>
            </div>

            {analytics.structureWithPercent.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Структура затрат</h3>
                     {/* Pie Chart and legend can be added here if needed */}
                </div>
            )}
            
            <div className="space-y-4 pt-6 border-t border-dashed">
                <h3 className="font-semibold text-gray-800">Калькулятор прибыли</h3>
                {/* ... inputs for yield and price ... */}
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                     {/* ... profit calculation results ... */}
                </div>
            </div>
        </div>
    )
}

const FieldDetail: React.FC = () => {
    const { fieldId } = useParams<{ fieldId: string }>();
    const numericFieldId = fieldId ? parseInt(fieldId, 10) : undefined;

    // --- Получаем реальные данные с сервера ---
    const { data: field, isLoading: isLoadingField } = useGetFieldById(numericFieldId);
    const { data: operations = [], isLoading: isLoadingOps } = useGetFieldOperations(numericFieldId);
    const { data: history = [], isLoading: isLoadingHistory } = useGetCropHistory(numericFieldId);
    const { mutate: addFieldOperation } = useCreateFieldOperation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [operationType, setOperationType] = useState('');
    const [operationDate, setOperationDate] = useState(new Date().toISOString().split('T')[0]);
    const [operationNotes, setOperationNotes] = useState('');
    const [operationCost, setOperationCost] = useState('');
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any | null>(null);

    const isLoading = isLoadingField || isLoadingOps || isLoadingHistory;

    useEffect(() => {
        if (isLoading || !field || !mapContainerRef.current || mapRef.current) return;
        // ... (map initialization logic remains the same)
        if (field.polygon && field.polygon.length > 2) {
            const leafletCoords: [number, number][] = field.polygon.map(p => [p[1], p[0]]);
            
            const bounds = L.latLngBounds(leafletCoords);
            const map = L.map(mapContainerRef.current).fitBounds(bounds);
            mapRef.current = map;

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
            L.polygon(leafletCoords, { color: '#fbbf24', weight: 3, fillOpacity: 0.4 }).addTo(map);
        }
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };

    }, [field, isLoading]);


    const handleAddOperation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!numericFieldId || !operationType || !operationDate) {
            alert('Пожалуйста, заполните тип и дату операции.');
            return;
        }
        const newOperation: FieldOperationPayload = {
            fieldId: numericFieldId,
            type: operationType,
            date: operationDate,
            notes: operationNotes,
            cost: operationCost ? parseFloat(operationCost) : undefined,
        };
        addFieldOperation(newOperation, {
            onSuccess: () => {
                setIsModalOpen(false);
                setOperationType('');
                setOperationDate(new Date().toISOString().split('T')[0]);
                setOperationNotes('');
                setOperationCost('');
            }
        });
    };

    if (isLoading) {
        return <div className="text-center p-10">Загрузка данных поля...</div>;
    }

    if (!field) {
        return (
             <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-red-500">Поле не найдено</h1>
                <Link to="/my-fields" className="mt-4 inline-block text-blue-600 hover:underline">
                    Вернуться к списку полей
                </Link>
            </div>
        );
    }
    
    const sortedOperations = [...operations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedHistory = [...history].sort((a, b) => b.year - a.year);

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <Link to="/my-fields" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2 flex-grow">{field.name}</h1>
                <Link to={`/edit-field/${field.id}`} className="p-2 rounded-full hover:bg-gray-200" aria-label="Редактировать поле">
                    <ICONS.edit className="w-6 h-6 text-gray-600"/>
                </Link>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
                <div ref={mapContainerRef} className="w-full h-52 rounded-lg bg-gray-200"/>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500">Площадь</p>
                        <p className="text-2xl font-bold text-gray-800">{field.area} <span className="text-lg">га</span></p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Текущая культура</p>
                        <p className="text-xl font-bold text-gray-800">{field.currentCrop}</p>
                    </div>
                </div>
            </div>
            
            <CollapsibleSection title="Финансовая аналитика" icon={ICONS.chartPie} defaultOpen>
                <FinancialAnalytics operations={operations} area={field.area} />
            </CollapsibleSection>

            <CollapsibleSection title="Журнал операций" icon={ICONS.clipboardList}>
                <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-blue-700 flex items-center gap-1 justify-center">
                    <ICONS.plus className="w-4 h-4"/>
                    <span>Новая операция</span>
                </button>
                <div className="space-y-3">
                    {sortedOperations.length > 0 ? sortedOperations.map(op => (
                         <div key={op.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-semibold text-gray-800">{op.type}</span>
                                    {op.cost && <p className="text-xs text-red-600 font-medium">-{op.cost.toLocaleString('ru-RU')} ₽</p>}
                                </div>
                                <span className="text-sm text-gray-500">{new Date(op.date).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{op.notes}</p>
                         </div>
                    )) 
                    : <p className="text-center text-gray-500 py-4">Операций еще не было.</p>}
                </div>
            </CollapsibleSection>

             <CollapsibleSection title="История севооборота" icon={ICONS.undo}>
                 <div className="space-y-2">
                    {sortedHistory.length > 0 ? sortedHistory.map(h => (
                         <div key={h.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <span className="font-semibold text-gray-700">{h.year}</span>
                            <span className="text-gray-800">{h.crop}</span>
                         </div>
                    )) : <p className="text-center text-gray-500 py-4">Истории севооборота еще нет.</p>}
                </div>
            </CollapsibleSection>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Добавить операцию</h2>
                        <form onSubmit={handleAddOperation} className="space-y-4">
                            {/* ... Form inputs ... */}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldDetail;