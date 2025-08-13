
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product, Shop } from '../types';
import { ICONS } from '../constants';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  shop: Shop | undefined;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, shop }) => {
  const { addToCart, isInCart } = useCart();

  if (!shop) {
    return null; // Or a loading/error state
  }
  
  const inCart = isInCart(product.id);
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation if card is wrapped in a link
    if (!isOutOfStock && !inCart) {
      addToCart(product.id, product.name);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
        <span
          className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full text-white ${
            product.isNew ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        >
          {product.isNew ? 'Новый' : 'Б/У'}
        </span>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-gray-500">{product.category}</p>
        <h3 className="text-md font-bold text-gray-800 truncate mt-1 flex-grow">{product.name}</h3>
        
        <div className="mt-2">
            <p className="text-lg font-extrabold text-blue-600">{product.price}</p>
            <p className={`text-xs ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
              {isOutOfStock ? 'Нет в наличии' : `В наличии: ${product.quantity} шт.`}
            </p>
        </div>

        <div className="flex items-center mt-2 text-sm text-gray-600">
          <Link to={`/shop/${shop.id}`} className="hover:underline">
            <span>{shop.name}</span>
          </Link>
          <ICONS.star className="w-4 h-4 text-yellow-400 ml-2 mr-1" />
          <span>{shop.rating}</span>
        </div>
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock || inCart}
          className={`w-full mt-4 font-bold py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
            ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : ''}
            ${inCart ? 'bg-green-600 text-white cursor-default' : ''}
            ${!isOutOfStock && !inCart ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          `}
        >
          {inCart ? (
            <>
              <ICONS.checkCircle className="w-5 h-5" />
              В корзине
            </>
          ) : (
            <>
              <ICONS.cart className="w-5 h-5" />
              {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;