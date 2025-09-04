import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ICONS } from '../constants';
import type { ChatMessage } from '../types';
import { useGetProducts } from '../hooks/useGetProducts';
import { useGetShops } from '../hooks/useGetShops';

// ... (Весь вспомогательный код: fileToBase64, getWeatherDataForPrompt, ChatMessageBubble, LoadingBubble - остается без изменений) ...
const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

const OPENWEATHER_API_KEY = 'ba915e5a9efdfcd2c4b3c4ffb8214deb';

const getWeatherDataForPrompt = (): Promise<string> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation || !OPENWEATHER_API_KEY) {
            resolve('');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=ru&appid=${OPENWEATHER_API_KEY}`);
                    if (!forecastResponse.ok) { resolve(''); return; }
                    const forecastData = await forecastResponse.json();
                    const dailyData = forecastData.list.reduce((acc: any, item: any) => {
                        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(item);
                        return acc;
                    }, {});
                    let weatherContext = `\n\nКонтекст о погоде для текущего местоположения (${forecastData.city.name}).\nТекущая погода: ${forecastData.list[0].main.temp.toFixed(0)}°C, ${forecastData.list[0].weather[0].description}.\nПрогноз на ближайшие дни:\n`;
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    Object.keys(dailyData).sort().slice(0, 4).forEach(dateStr => {
                        const dayItems = dailyData[dateStr];
                        const dateObj = new Date(dayItems[0].dt * 1000);
                        const dayTemps = dayItems.map((i: any) => i.main.temp);
                        const description = (dayItems.find((i: any) => new Date(i.dt * 1000).getHours() >= 12) || dayItems[0]).weather[0].description;
                        const rainInfo = dayItems.some((i: any) => (i.weather[0].id >= 300 && i.weather[0].id < 600)) ? "ожидается дождь" : "без существенных осадков";
                        weatherContext += `- ${dateObj.toLocaleDateString('ru-RU', { weekday: 'long' })} (${dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}): от ${Math.min(...dayTemps).toFixed(0)}°C до ${Math.max(...dayTemps).toFixed(0)}°C, ${description}, ${rainInfo}.\n`;
                    });
                    resolve(weatherContext);
                } catch (error) { resolve(''); }
            },
            () => resolve(''),
            { timeout: 5000 }
        );
    });
};

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-end gap-2 ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${isModel ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
                {message.imageUrl && (
                    <img src={message.imageUrl} alt="Прикрепленное изображение" className="mb-2 rounded-lg object-cover max-w-full" />
                )}
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
            </div>
        </div>
    );
};

const LoadingBubble: React.FC = () => (
    <div className="flex items-end gap-2 justify-start">
        <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
        </div>
    </div>
);


const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: 'Здравствуйте! Я ваш Агро-Ассистент. Спросите меня о наличии запчастей, ценах, агротехнологиях или прикрепите фото больного растения для диагностики.' }
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false); // Changed from 'loading'
    const [selectedImage, setSelectedImage] = useState<{ file: File, previewUrl: string } | null>(null);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    
    // --- Получаем реальные данные о товарах и магазинах ---
    const { data: products = [] } = useGetProducts();
    const { data: shops = [] } = useGetShops();

    const productContext = useMemo(() => {
        if (!products.length || !shops.length) return '';
        const inventoryList = products.map(p => {
            const shop = shops.find(s => s.id === p.shopId);
            return `- ${p.name} (Категория: ${p.category}, Цена: ${p.price}, В наличии: ${p.quantity} шт., Продавец: ${shop?.name || 'Неизвестно'})`;
        }).join('\n');
        return `Вот список доступных товаров в магазинах-партнерах:\n${inventoryList}`;
    }, [products, shops]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(scrollToBottom, [messages, isSending]);
    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl);
            const previewUrl = URL.createObjectURL(file);
            setSelectedImage({ file, previewUrl });
        }
        e.target.value = "";
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !selectedImage || isSending) return;

        const userMessage: ChatMessage = { role: 'user', content: input, imageUrl: selectedImage?.previewUrl };
        setMessages(prev => [...prev, userMessage]);
        
        const currentInput = input;
        const currentImage = selectedImage;
        setInput('');
        setSelectedImage(null);
        setIsSending(true);

        try {
            if (!process.env.API_KEY) throw new Error("API_KEY не найден.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const weatherContext = await getWeatherDataForPrompt();
            
            let systemInstruction = `Ты — «Агро-Ассистент», опытный и дружелюбный агроном-эксперт...`; // Truncated for brevity
            systemInstruction += `\nКонтекст о товарах:\n${productContext}`;

            const contents: any[] = [{ text: `Вопрос пользователя: "${currentInput}"` }];
            if (currentImage) {
                contents.unshift({ inlineData: { data: await fileToBase64(currentImage.file), mimeType: currentImage.file.type } });
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: contents },
                config: { systemInstruction }
            });

            setMessages(prev => [...prev, { role: 'model', content: response.text.trim() }]);

        } catch (error) {
            console.error("Ошибка при вызове Gemini API:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Извините, произошла техническая ошибка." }]);
        } finally {
            setIsSending(false);
            if(currentImage?.previewUrl) URL.revokeObjectURL(currentImage.previewUrl);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => <ChatMessageBubble key={index} message={msg} />)}
                {isSending && <LoadingBubble />}
                <div ref={messagesEndRef} />
            </div>

             {isActionSheetOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 flex items-end" onClick={() => setIsActionSheetOpen(false)}>
                     {/* ... Action Sheet buttons ... */}
                </div>
            )}

            <div className="flex-shrink-0 p-2 border-t border-gray-200 bg-gray-50 sm:p-4">
                 {selectedImage && (
                     <div className="px-2 pb-2 relative w-fit">
                         {/* ... Image preview ... */}
                     </div>
                )}
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input type="file" ref={galleryInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                    <input type="file" ref={cameraInputRef} onChange={handleImageSelect} accept="image/*" capture="environment" className="hidden" />
                    <button type="button" onClick={() => setIsActionSheetOpen(true)} className="text-gray-500 hover:text-blue-600 p-2.5 rounded-full" disabled={isSending}>
                        <ICONS.paperClip className="w-5 h-5"/>
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Спросите что-нибудь..."
                        className="w-full px-4 py-2.5 border rounded-full"
                        disabled={isSending}
                    />
                    <button type="submit" disabled={isSending || (!input.trim() && !selectedImage)} className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:bg-blue-300">
                        <ICONS.send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;