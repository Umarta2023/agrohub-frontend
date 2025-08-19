import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// 1. Убираем Navigate, useNavigate из импорта
import { Routes, Route } from 'react-router-dom'; 
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Marketplace from './pages/Marketplace';
import AdBoard from './pages/AdBoard';
import Services from './pages/Services';
import InfoHub from './pages/InfoHub';
import NotFound from './pages/NotFound';
import AIAssistant from './pages/AIAssistant';
import MyShop from './pages/MyShop';
import Shop from './pages/Shop';
import MyServices from './pages/MyServices';
import ServiceProvider from './pages/ServiceProvider';
import AgroCalculators from './pages/AgroCalculators';
import AgroWeather from './pages/AgroWeather';
import MyFields from './pages/MyFields';
import FieldDetail from './pages/FieldDetail';
import AddField from './pages/AddField';
import EditField from './pages/EditField';
import ServiceRequest from './pages/ServiceRequest';
import MyRequests from './pages/MyRequests';
import { CartProvider, useCart } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import PurchaseHistory from './pages/PurchaseHistory';
import NotificationCenter from './pages/NotificationCenter';
import News from './pages/News';

// 2. Полностью удаляем отсюда компонент RootRedirector

const App: React.FC = () => {
  // 3. Убеждаемся, что здесь нет useEffect и useNavigate

  const Toast: React.FC = () => {
      const { toastMessage, setToastMessage } = useCart();
      const [visible, setVisible] = useState(false);
      const toastRoot = document.getElementById('toast-root');

      useEffect(() => {
          if (toastMessage) {
              setVisible(true);
              const timer = setTimeout(() => {
                  setVisible(false);
                  setTimeout(() => setToastMessage(null), 300); 
              }, 2000);
              return () => clearTimeout(timer);
          }
      }, [toastMessage, setToastMessage]);

      if (!toastMessage || !toastRoot) return null;

      return ReactDOM.createPortal(
          <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 z-[9999] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              {toastMessage}
          </div>,
          toastRoot
      );
  };

  return (
    <CartProvider>
      <div className="h-screen w-screen max-w-md mx-auto flex flex-col font-sans bg-white shadow-2xl">
        {/* 4. Возвращаем нормальный заголовок */}
        <Header title="АгроХаб" />
        <main className="flex-grow overflow-y-auto pb-16 bg-gray-50 relative">
          <Routes>
            {/* 5. Убеждаемся, что здесь нет маршрута для RootRedirector */}
            <Route path="/" element={<Marketplace />} />
            <Route path="/ads" element={<AdBoard />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/services" element={<Services />} />
            <Route path="/info" element={<InfoHub />} />
            <Route path="/my-shop" element={<MyShop />} />
            <Route path="/shop/:shopId" element={<Shop />} />
            <Route path="/my-services" element={<MyServices />} />
            <Route path="/provider/:providerId" element={<ServiceProvider />} />
            <Route path="/agro-calculators" element={<AgroCalculators />} />
            <Route path="/agro-weather" element={<AgroWeather />} />
            <Route path="/my-fields" element={<MyFields />} />
            <Route path="/field/:fieldId" element={<FieldDetail />} />
            <Route path="/add-field" element={<AddField />} />
            <Route path="/edit-field/:fieldId" element={<EditField />} />
            <Route path="/request-service/:serviceId" element={<ServiceRequest />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/purchase-history" element={<PurchaseHistory />} />
            <Route path="/notification-center" element={<NotificationCenter />} />
            <Route path="/news" element={<News />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomNav />
        <Toast />
      </div>
    </CartProvider>
  );
};

export default App;