
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';

const navItems = [
  { path: '/', label: 'Маркет', icon: ICONS.marketplace },
  { path: '/ads', label: 'Объявления', icon: ICONS.ads },
  { path: '/ai-assistant', label: 'Ассистент', icon: ICONS.ai_assistant },
  { path: '/services', label: 'Услуги', icon: ICONS.services },
  { path: '/info', label: 'ИнфоХаб', icon: ICONS.info },
];

const BottomNav: React.FC = () => {
  const baseStyle = "flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors duration-200 w-full pt-2 pb-1";
  const activeStyle = "text-blue-600";

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-gray-200 flex justify-around z-10">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : ''}`}
          end={item.path === '/'}
        >
          <item.icon className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;