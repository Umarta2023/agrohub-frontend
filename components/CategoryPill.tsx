
import React from 'react';

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ label, isActive, onClick }) => {
  const baseClasses = 'px-4 py-2 text-sm font-semibold rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap';
  const activeClasses = 'bg-blue-600 text-white shadow-md';
  const inactiveClasses = 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

export default CategoryPill;