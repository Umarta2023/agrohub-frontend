
import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import AdCard from '../components/AdCard';
import CategoryPill from '../components/CategoryPill';
import useMockData from '../hooks/useMockData';
import type { Ad } from '../types';

const CATEGORIES = ['Все', 'Зерновые', 'Овощи', 'Молочная продукция', 'Масличные'];

const AdBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const { ads, loading } = useMockData();

  const filteredAds = useMemo(() => {
    return ads
      .filter(ad => activeCategory === 'Все' || ad.category === activeCategory)
      .filter(ad => ad.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ads, activeCategory, searchTerm]);

  return (
    <div>
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Поиск по продукции..."
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
        <div className="p-4 space-y-4">
          {filteredAds.map(ad => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdBoard;