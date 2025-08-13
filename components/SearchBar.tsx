
import React from 'react';
import { ICONS } from '../constants';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative p-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
      />
      <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
        <ICONS.search className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;