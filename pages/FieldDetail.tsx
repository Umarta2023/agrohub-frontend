
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useMockData from '../hooks/useMockData';
import { ICONS } from '../constants';
import { FieldOperationPayload, FieldOperation } from '../types';

// Tell TypeScript that L exists in the global scope, loaded from a <script> tag.
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
            <div
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
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
            // Simple categorization for demo purposes
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

        const structureWithPercent = Object.entries(costStructure).map(([category, cost]) => ({
            category,
            cost,
            percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
        })).sort((a,b) => b.cost - a.cost);

        // Profit calculation
        const numYield = parseFloat(plannedYield); // c/ha -> t/ha
        const numPrice = parseFloat(plannedPrice); // rub/t
        
        let revenuePerHa = 0, profitPerHa = 0, totalRevenue = 0, totalProfit = 0;
        if (!isNaN(numYield) && !isNaN(numPrice) && area > 0) {
            revenuePerHa = (numYield / 10) * numPrice;
            profitPerHa = revenuePerHa - costPerHa;
            totalRevenue = revenuePerHa * area;
            totalProfit = profitPerHa * area;
        }

        return {
            totalCost,
            costPerHa,
            structureWithPercent,
            revenuePerHa,
            profitPerHa,
            totalRevenue,
            totalProfit,
        }
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
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24">
                            {/* Pie Chart SVG */}
                             <svg viewBox="0 0 36 36" className="w-full h-full">
                                {
                                    (() => {
                                        let cumulativePercent = 0;
                                        return analytics.structureWithPercent.map((item, index) => {
                                            const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
                                            const strokeDashoffset = 25 - cumulativePercent;
                                            cumulativePercent += item.percentage;
                                            return (
                                                <circle
                                                    key={item.category}
                                                    cx="18" cy="18" r="15.915"
                                                    fill="transparent"
                                                    strokeWidth="3.8"
                                                    stroke={COLORS[index % COLORS.length].replace('bg-', '')}
                                                    strokeDasharray={strokeDasharray}
                                                    strokeDashoffset={strokeDashoffset}
                                                    transform="rotate(-90 18 18)"
                                                />
                                            );
                                        })
                                    })()
                                }
                            </svg>
                        </div>
                        <div className="flex-1 space-y-2 text-xs">
                             {analytics.structureWithPercent.map((item, index) => (
                                 <div key={item.category} className="flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                         <span className={`w-2.5 h-2.5 rounded-full ${COLORS[index % COLORS.length]}`}></span>
                                         <span>{item.category}</span>
                                     </div>
                                     <span className="font-semibold">{item.percentage.toFixed(1)}%</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="space-y-4 pt-6 border-t border-dashed">
                <h3 className="font-semibold text-gray-800">Калькулятор прибыли</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Планируемая урожайность (ц/га)</label>
                        <input type="number" value={plannedYield} onChange={e => setPlannedYield(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Планируемая цена (₽/т)</label>
                        <input type="number" value={plannedPrice} onChange={e => setPlannedPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mt-1" />
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-green-800">Выручка с гектара:</span>
                        <span className="font-bold text-green-700">{analytics.revenuePerHa.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-green-800">Прибыль с гектара:</span>
                        <span className="font-bold text-green-700">{analytics.profitPerHa.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽</span>
                    </div>
                     <div className="flex justify-between items-center font-bold text-md mt-2 pt-2 border-t border-green-200">
                        <span className="text-green-800">Общая прибыль с поля:</span>
                        <span className="text-green-700">{analytics.totalProfit.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

const FieldDetail: React.FC = () => {
    const { fieldId } = useParams<{ fieldId: string }>();
    const { fields, fieldOperations, cropHistory, addFieldOperation, loading } = useMockData();
    
    const field = fields.find(f => f.id === fieldId);
    const operations = fieldOperations.filter(op => op.fieldId === fieldId);
    const history = cropHistory.filter(h => h.fieldId === fieldId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [operationType, setOperationType] = useState('');
    const [operationDate, setOperationDate] = useState(new Date().toISOString().split('T')[0]);
    const [operationNotes, setOperationNotes] = useState('');
    const [operationCost, setOperationCost] = useState('');
    
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any | null>(null);

    useEffect(() => {
        if (loading || !field || !mapContainerRef.current || mapRef.current) return;

        if (field.polygon && field.polygon.length > 2) {
            const leafletCoords: [number, number][] = field.polygon.map(p => [p[1], p[0]]);
            
            const bounds = L.latLngBounds(leafletCoords);
            const map = L.map(mapContainerRef.current).fitBounds(bounds);
            mapRef.current = map;

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(map);

            L.polygon(leafletCoords, { color: '#fbbf24', weight: 3, fillOpacity: 0.4 }).addTo(map);
        } else {
             const map = L.map(mapContainerRef.current).setView([45.035, 38.975], 13);
             mapRef.current = map;
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        }
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };

    }, [field, loading]);


    const handleAddOperation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fieldId || !operationType || !operationDate) {
            alert('Пожалуйста, заполните тип и дату операции.');
            return;
        }
        const newOperation: FieldOperationPayload = {
            fieldId,
            type: operationType,
            date: operationDate,
            notes: operationNotes,
            cost: operationCost ? parseFloat(operationCost) : undefined,
        };
        addFieldOperation(newOperation);
        
        setIsModalOpen(false);
        setOperationType('');
        setOperationDate(new Date().toISOString().split('T')[0]);
        setOperationNotes('');
        setOperationCost('');
    };

    if (loading) {
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Тип операции</label>
                                <input type="text" value={operationType} onChange={e => setOperationType(e.target.value)} placeholder="Напр., Внесение удобрений" className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Дата</label>
                                <input type="date" value={operationDate} onChange={e => setOperationDate(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Затраты на операцию (₽)</label>
                                <input type="number" value={operationCost} onChange={e => setOperationCost(e.target.value)} placeholder="Напр., 50000" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700">Заметки</label>
                                <textarea value={operationNotes} onChange={e => setOperationNotes(e.target.value)} rows={3} placeholder="Любые детали, напр., название препарата, дозировка" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Отмена</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Добавить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldDetail;