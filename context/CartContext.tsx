import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (productId: string, productName: string) => void;
    removeFromCart: (productId: string) => void;
    updateItemQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
    getCartCount: () => number;
    toastMessage: string | null;
    setToastMessage: (message: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const addToCart = (productId: string, productName: string) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.productId === productId);
            if (existingItem) {
                // For simplicity, we just notify it's already there if clicked again.
                // A real app might increment quantity here.
                return prevItems;
            }
            return [...prevItems, { productId, quantity: 1 }];
        });
        setToastMessage(`"${productName}" добавлен в корзину`);
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    };

    const updateItemQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };
    
    const isInCart = (productId: string): boolean => {
        return cartItems.some(item => item.productId === productId);
    };

    const getCartCount = (): number => {
        return cartItems.length;
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateItemQuantity,
            clearCart,
            isInCart,
            getCartCount,
            toastMessage,
            setToastMessage,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};