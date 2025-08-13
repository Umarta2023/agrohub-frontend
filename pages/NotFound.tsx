
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="text-xl font-medium text-gray-800 mt-4">Страница не найдена</p>
      <p className="text-gray-500 mt-2">
        Извините, мы не можем найти страницу, которую вы ищете.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;