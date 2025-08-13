
import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import CategoryPill from '../components/CategoryPill';
import useMockData from '../hooks/useMockData';
import type { Service } from '../types';

const CATEGORIES = ['Все', 'Ремонт техники', 'Агро-консультации', 'Транспорт', 'Обработка полей'];

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const { services, serviceProviders, loading } = useMockData();

  const filteredServices = useMemo(() => {
    return services
      .filter(s => activeCategory === 'Все' || s.category === activeCategory)
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [services, activeCategory, searchTerm]);

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
      {loading ? (
        <div className="text-center p-10">Загрузка...</div>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map(service => {
            const provider = serviceProviders.find(p => p.id === service.providerId);
            return <ServiceCard key={service.id} service={service} provider={provider} />
          })}
        </div>
      )}
    </div>
  );
};

export default Services;