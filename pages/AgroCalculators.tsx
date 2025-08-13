
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

type CalculatorTab = 'seeding' | 'fertilizer' | 'profitability' | 'spraying';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
            isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
        }`}
    >
        {label}
    </button>
);

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit: string; type?: string }> = ({ label, value, onChange, unit, type = "number" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type={type}
                value={value}
                onChange={onChange}
                min="0"
                step="any"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{unit}</span>
            </div>
        </div>
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ label, value, onChange, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select value={value} onChange={onChange} className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {children}
        </select>
    </div>
);


const ResultDisplay: React.FC<{ value: number | null; unit: string; label?: string }> = ({ value, unit, label = 'Результат:' }) => (
     <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-gray-600">{label}</p>
        <div className="mt-2 text-center bg-blue-50 p-6 rounded-lg">
            {value !== null && !isNaN(value) && isFinite(value) ? (
                <>
                    <span className="text-4xl font-extrabold text-blue-600">{value.toLocaleString('ru-RU')}</span>
                    <span className="ml-2 text-xl font-medium text-blue-500">{unit}</span>
                </>
            ) : (
                <p className="text-gray-500">Введите корректные данные</p>
            )}
        </div>
    </div>
);


const SeedingCalculator = () => {
    const [density, setDensity] = useState('5');
    const [weight, setWeight] = useState('40');
    const [suitability, setSuitability] = useState('92');

    const seedingRate = useMemo(() => {
        const numDensity = parseFloat(density);
        const numWeight = parseFloat(weight);
        const numSuitability = parseFloat(suitability);
        if (!isNaN(numDensity) && !isNaN(numWeight) && !isNaN(numSuitability) && numSuitability > 0) {
            const rate = (numDensity * numWeight) / (numSuitability / 100);
            return parseFloat(rate.toFixed(1));
        }
        return null;
    }, [density, weight, suitability]);
    
    return (
        <div className="space-y-4">
            <InputField label="Желаемая густота стояния" value={density} onChange={(e) => setDensity(e.target.value)} unit="млн. шт./га" />
            <InputField label="Масса 1000 семян" value={weight} onChange={(e) => setWeight(e.target.value)} unit="г" />
            <InputField label="Посевная годность (всхожесть)" value={suitability} onChange={(e) => setSuitability(e.target.value)} unit="%" />
            <ResultDisplay value={seedingRate} unit="кг/га" />
        </div>
    );
}

const FertilizerCalculator = () => {
    const [yieldPlan, setYieldPlan] = useState('50');
    const [n_removal, setN_removal] = useState('30');
    const [p_removal, setP_removal] = useState('12');
    const [k_removal, setK_removal] = useState('25');
    const [area, setArea] = useState('100');

    const { perHa, total } = useMemo(() => {
        const numYield = parseFloat(yieldPlan);
        const numN = parseFloat(n_removal);
        const numP = parseFloat(p_removal);
        const numK = parseFloat(k_removal);
        const numArea = parseFloat(area);

        if ([numYield, numN, numP, numK, numArea].every(v => !isNaN(v) && v >= 0)) {
            const yieldInTonnes = numYield / 10;
            const nPerHa = yieldInTonnes * numN;
            const pPerHa = yieldInTonnes * numP;
            const kPerHa = yieldInTonnes * numK;
            
            const nTotal = nPerHa * numArea;
            const pTotal = pPerHa * numArea;
            const kTotal = kPerHa * numArea;
            
            return {
                perHa: { n: nPerHa, p: pPerHa, k: kPerHa },
                total: { n: nTotal, p: pTotal, k: kTotal }
            };
        }
        return { perHa: null, total: null };
    }, [yieldPlan, n_removal, p_removal, k_removal, area]);

    return (
        <div className="space-y-4">
             <InputField label="Планируемая урожайность" value={yieldPlan} onChange={(e) => setYieldPlan(e.target.value)} unit="ц/га" />
             <InputField label="Площадь поля" value={area} onChange={(e) => setArea(e.target.value)} unit="га" />
             <InputField label="Вынос Азота (N) на 1т продукции" value={n_removal} onChange={(e) => setN_removal(e.target.value)} unit="кг" />
             <InputField label="Вынос Фосфора (P) на 1т продукции" value={p_removal} onChange={(e) => setP_removal(e.target.value)} unit="кг" />
             <InputField label="Вынос Калия (K) на 1т продукции" value={k_removal} onChange={(e) => setK_removal(e.target.value)} unit="кг" />
            
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-gray-600 font-semibold">Норма на 1 гектар:</p>
                {perHa ? (
                    <div className="grid grid-cols-3 gap-2 text-center mt-2">
                        <div className="bg-green-50 p-3 rounded-lg"><span className="font-bold text-lg text-green-700">{perHa.n.toFixed(1)}</span><p className="text-sm">кг/га Азота</p></div>
                        <div className="bg-purple-50 p-3 rounded-lg"><span className="font-bold text-lg text-purple-700">{perHa.p.toFixed(1)}</span><p className="text-sm">кг/га Фосфора</p></div>
                        <div className="bg-orange-50 p-3 rounded-lg"><span className="font-bold text-lg text-orange-700">{perHa.k.toFixed(1)}</span><p className="text-sm">кг/га Калия</p></div>
                    </div>
                ) : <p className="text-gray-500 mt-2 text-center">Введите корректные данные</p>}
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                <p className="text-gray-600 font-semibold">Итого на всю площадь ({area || 0} га):</p>
                {total ? (
                    <div className="grid grid-cols-3 gap-2 text-center mt-2">
                         <div className="bg-green-100 p-3 rounded-lg"><span className="font-bold text-lg text-green-800">{total.n.toLocaleString('ru-RU', {maximumFractionDigits: 0})}</span><p className="text-sm">кг Азота</p></div>
                        <div className="bg-purple-100 p-3 rounded-lg"><span className="font-bold text-lg text-purple-800">{total.p.toLocaleString('ru-RU', {maximumFractionDigits: 0})}</span><p className="text-sm">кг Фосфора</p></div>
                        <div className="bg-orange-100 p-3 rounded-lg"><span className="font-bold text-lg text-orange-800">{total.k.toLocaleString('ru-RU', {maximumFractionDigits: 0})}</span><p className="text-sm">кг Калия</p></div>
                    </div>
                ) : <p className="text-gray-500 mt-2 text-center">Введите корректные данные</p>}
            </div>
        </div>
    );
}

const ProfitabilityCalculator = () => {
    const [revenue, setRevenue] = useState('100000');
    const [seedCost, setSeedCost] = useState('15000');
    const [fertilizerCost, setFertilizerCost] = useState('20000');
    const [fuelCost, setFuelCost] = useState('10000');
    const [otherCost, setOtherCost] = useState('5000');

    const { totalCost, profit, profitability } = useMemo(() => {
        const costs = [seedCost, fertilizerCost, fuelCost, otherCost].map(parseFloat);
        const numRevenue = parseFloat(revenue);
        if (costs.every(c => !isNaN(c)) && !isNaN(numRevenue)) {
            const totalCost = costs.reduce((sum, a) => sum + a, 0);
            const profit = numRevenue - totalCost;
            const profitability = totalCost > 0 ? (profit / totalCost) * 100 : 0;
            return { totalCost, profit, profitability: parseFloat(profitability.toFixed(1)) };
        }
        return { totalCost: null, profit: null, profitability: null };
    }, [revenue, seedCost, fertilizerCost, fuelCost, otherCost]);

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Доходы:</h3>
            <InputField label="Выручка с 1 гектара" value={revenue} onChange={(e) => setRevenue(e.target.value)} unit="₽" />
            <h3 className="font-semibold text-gray-800 pt-2">Расходы:</h3>
             <InputField label="Затраты на семена" value={seedCost} onChange={(e) => setSeedCost(e.target.value)} unit="₽/га" />
             <InputField label="Затраты на удобрения и СЗР" value={fertilizerCost} onChange={(e) => setFertilizerCost(e.target.value)} unit="₽/га" />
             <InputField label="Затраты на ГСМ" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} unit="₽/га" />
             <InputField label="Прочие расходы" value={otherCost} onChange={(e) => setOtherCost(e.target.value)} unit="₽/га" />
             
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-gray-600">Финансовый результат:</p>
                {profit !== null ? (
                    <div className="space-y-3 mt-2">
                         <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                            <span className="font-medium text-gray-700">Общие затраты:</span>
                            <span className="font-bold text-lg text-red-600">{totalCost?.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-700">Прибыль:</span>
                            <span className="font-bold text-lg text-green-600">{profit.toLocaleString('ru-RU')} ₽</span>
                        </div>
                         <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-700">Рентабельность:</span>
                            <span className="font-bold text-lg text-blue-600">{profitability}%</span>
                        </div>
                    </div>
                ) : <p className="text-gray-500 mt-2 text-center">Введите корректные данные</p>}
            </div>
        </div>
    );
}

const SPRAY_NOZZLES = [
    { color: 'Оранжевая', name: 'ISO 110-01', flowAt3Bar: 0.39 },
    { color: 'Зеленая', name: 'ISO 110-015', flowAt3Bar: 0.58 },
    { color: 'Желтая', name: 'ISO 110-02', flowAt3Bar: 0.78 },
    { color: 'Синяя', name: 'ISO 110-03', flowAt3Bar: 1.17 },
    { color: 'Красная', name: 'ISO 110-04', flowAt3Bar: 1.56 },
    { color: 'Коричневая', name: 'ISO 110-05', flowAt3Bar: 1.95 },
    { color: 'Серая', name: 'ISO 110-06', flowAt3Bar: 2.34 },
];

const SprayingCalculator = () => {
    const [nozzleIndex, setNozzleIndex] = useState('2'); // Default to Yellow
    const [speed, setSpeed] = useState('10');
    const [pressure, setPressure] = useState('3');
    const nozzleSpacing = 0.5; // meters, standard

    const sprayRate = useMemo(() => {
        const nozzle = SPRAY_NOZZLES[parseInt(nozzleIndex, 10)];
        const numSpeed = parseFloat(speed);
        const numPressure = parseFloat(pressure);
        
        if (!nozzle || isNaN(numSpeed) || isNaN(numPressure) || numSpeed <= 0 || numPressure <= 0) {
            return null;
        }
        
        const flowAtCurrentPressure = nozzle.flowAt3Bar * Math.sqrt(numPressure / 3);
        const rate = (flowAtCurrentPressure * 600) / (numSpeed * nozzleSpacing);
        
        return parseFloat(rate.toFixed(1));

    }, [nozzleIndex, speed, pressure]);

    return (
        <div className="space-y-4">
            <SelectField label="Тип форсунки (по цвету ISO)" value={nozzleIndex} onChange={(e) => setNozzleIndex(e.target.value)}>
                {SPRAY_NOZZLES.map((n, index) => (
                    <option key={index} value={index}>{n.color} ({n.name})</option>
                ))}
            </SelectField>
            <InputField label="Скорость движения" value={speed} onChange={(e) => setSpeed(e.target.value)} unit="км/ч" />
            <InputField label="Рабочее давление" value={pressure} onChange={(e) => setPressure(e.target.value)} unit="бар" />
            <ResultDisplay value={sprayRate} unit="л/га" label="Норма внесения рабочего раствора:" />
        </div>
    );
}

const AgroCalculators: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CalculatorTab>('seeding');

    const renderContent = () => {
        switch (activeTab) {
            case 'seeding':
                return <SeedingCalculator />;
            case 'fertilizer':
                return <FertilizerCalculator />;
            case 'profitability':
                return <ProfitabilityCalculator />;
            case 'spraying':
                return <SprayingCalculator />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center mb-6">
                <Link to="/info" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Агро-калькуляторы</h1>
            </div>

            <div className="mb-4 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                    <TabButton label="Норма высева" isActive={activeTab === 'seeding'} onClick={() => setActiveTab('seeding')} />
                    <TabButton label="Удобрения" isActive={activeTab === 'fertilizer'} onClick={() => setActiveTab('fertilizer')} />
                    <TabButton label="Рентабельность" isActive={activeTab === 'profitability'} onClick={() => setActiveTab('profitability')} />
                    <TabButton label="Опрыскивание" isActive={activeTab === 'spraying'} onClick={() => setActiveTab('spraying')} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                {renderContent()}
            </div>
        </div>
    );
};

export default AgroCalculators;