import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import CategoryPill from '../components/CategoryPill';
import { useGetServices } from '../hooks/useGetServices';
import { useGetServiceProviders } from '../hooks/useGetServiceProviders';

const CATEGORIES = ['Все', 'Ремонт техники', 'Агро-консультации', 'Транспорт', 'Обработка полей'];

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');

  // --- 1. Получаем реальные данные с сервера ---
  const { data: services = [], isLoading: isLoadingServices, isError: isErrorServices } = useGetServices();
  const { data: serviceProviders = [], isLoading: isLoadingProviders, isError: isErrorProviders } = useGetServiceProviders();

  // --- 2. Объединяем состояния загрузки и ошибок ---
  const isLoading = isLoadingServices || isLoadingProviders;
  const isError = isErrorServices || isErrorProviders;

  // --- 3. Логика фильтрации остается прежней ---
  const filteredServices = useMemo(() => {
    return services
      .filter(s => activeCategory === 'Все' || s.category === activeCategory)
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [services, activeCategory, searchTerm]);

  // --- 4. Обрабатываем состояния загрузки и ошибки ---
  if (isLoading) {
    return <div className="text-center p-10">Загрузка...</div>;
  }

  if (isError) {
    return <div className="text-center p-10 text-red-500">Не удалось загрузить данные. Попробуйте позже.</div>;
  }

  // --- 5. Основная разметка ---
  return (
    <div>
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Поиск по услугам..."
      />
      <div className="px-4 pb-3 overflow-x-auto">
        <div className="flex space-x-2">
          {CATEGORIES.map(cat => (
            <CategoryPill
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>
     
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map(service => {
          // Находим поставщика для каждой услуги. ID должны быть числами.
          const provider = serviceProviders.find(p => p.id === service.providerId);
          return provider ? <ServiceCard key={service.id} service={service} provider={provider} /> : null;
        })}
      </div>

      {filteredServices.length === 0 && (
          <p className="text-center text-gray-500 py-8">Услуги не найдены.</p>
      )}
    </div>
  );
};

export default Services;