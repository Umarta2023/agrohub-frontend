
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ICONS } from '../constants';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 flex items-center justify-between">
      <div className="w-10"></div>
      <h1 className="text-xl font-bold text-gray-800 text-center flex-grow">{title}</h1>
      <div className="w-10 flex justify-end">
        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
          <ICONS.cart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;