
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ICONS } from '../constants';
import type { ChatMessage } from '../types';
import useMockData from '../hooks/useMockData';

// Helper to convert file to base64
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
        if (!navigator.geolocation) {
            resolve('');
            return;
        }
        if (!OPENWEATHER_API_KEY) {
            console.error("OpenWeather API key is missing for AI Assistant.");
            resolve('');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=ru&appid=${OPENWEATHER_API_KEY}`);
                    if (!forecastResponse.ok) {
                        resolve('');
                        return;
                    }
                    const forecastData = await forecastResponse.json();
                    
                    const current = forecastData.list[0];

                    const dailyData: { [key: string]: any[] } = forecastData.list.reduce((acc: any, item: any) => {
                        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(item);
                        return acc;
                    }, {});

                    let weatherContext = `\n\nКонтекст о погоде для текущего местоположения (${forecastData.city.name}).\nТекущая погода: ${current.main.temp.toFixed(0)}°C, ${current.weather[0].description}.\nПрогноз на ближайшие дни:\n`;
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const upcomingDays = Object.keys(dailyData).sort().slice(0, 4);

                    upcomingDays.forEach(dateStr => {
                        const dayItems = dailyData[dateStr];
                        if (!dayItems || dayItems.length === 0) return;

                        const dayTemps = dayItems.map((i: any) => i.main.temp);
                        const minTemp = Math.min(...dayTemps);
                        const maxTemp = Math.max(...dayTemps);
                        
                        const middayItem = dayItems.find((i: any) => new Date(i.dt * 1000).getHours() >= 12) || dayItems[Math.floor(dayItems.length / 2)];
                        const description = middayItem.weather[0].description;
                        
                        const willItRain = dayItems.some((i: any) => (i.weather[0].id >= 300 && i.weather[0].id < 600));
                        const rainInfo = willItRain ? "ожидается дождь" : "без существенных осадков";
                        
                        const dateObj = new Date(dayItems[0].dt * 1000);
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        
                        let dayLabel;
                        if (dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth()) {
                            dayLabel = "Сегодня";
                        } else if (dateObj.getDate() === tomorrow.getDate() && dateObj.getMonth() === tomorrow.getMonth()) {
                            dayLabel = "Завтра";
                        } else {
                            dayLabel = dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
                        }
                        
                        const dateFormatted = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

                        weatherContext += `- ${dayLabel} (${dateFormatted}): температура от ${minTemp.toFixed(0)}°C до ${maxTemp.toFixed(0)}°C, ${description}, ${rainInfo}.\n`;
                    });

                    resolve(weatherContext);

                } catch (error) {
                    console.error("Error fetching weather for AI:", error);
                    resolve(''); 
                }
            },
            () => {
                resolve('');
            },
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
        {
            role: 'model',
            content: 'Здравствуйте! Я ваш Агро-Ассистент. Спросите меня о наличии запчастей, ценах, агротехнологиях или прикрепите фото больного растения для диагностики.'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ file: File, previewUrl: string } | null>(null);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    
    const { products, shops } = useMockData();

    const productContext = useMemo(() => {
        if (!products.length || !shops.length) return '';
        const inventoryList = products.map(p => {
            const shop = shops.find(s => s.id === p.shopId);
            return `- ${p.name} (Категория: ${p.category}, Цена: ${p.price}, В наличии: ${p.quantity} шт., Продавец: ${shop?.name || 'Неизвестно'})`;
        }).join('\n');
        return `Вот список доступных товаров в магазинах-партнерах:\n${inventoryList}`;
    }, [products, shops]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (selectedImage?.previewUrl) {
                URL.revokeObjectURL(selectedImage.previewUrl);
            }
            const previewUrl = URL.createObjectURL(file);
            setSelectedImage({ file, previewUrl });
        }
        e.target.value = "";
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !selectedImage || loading) return;

        const userMessage: ChatMessage = { 
            role: 'user', 
            content: input,
            imageUrl: selectedImage?.previewUrl
        };
        setMessages(prev => [...prev, userMessage]);
        
        const currentInput = input;
        const currentImage = selectedImage;
        setInput('');
        setSelectedImage(null);
        setLoading(true);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY не найден.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const weatherContext = await getWeatherDataForPrompt();
            
            let systemInstruction = `Ты — «Агро-Ассистент», опытный и дружелюбный агроном-эксперт. Твоя главная задача — давать развернутые, подробные и полезные советы фермерам. Общайся на русском языке. Не отвечай сухо или односложно. Всегда объясняй свои рекомендации, ссылаясь на агрономические знания.`;

            if (weatherContext) {
                systemInstruction += `\n\n**Обязательное правило при ответе на вопросы о погоде и планировании работ:** Ты ДОЛЖЕН использовать предоставленный ниже прогноз погоды. Проанализируй прогноз на ВСЕ доступные дни и дай комплексный совет. Не просто констатируй погоду, а интерпретируй ее для задачи пользователя. Например, если пользователь планирует сев, объясни, почему погода подходит или нет (учитывая температуру, влажность, предстоящие осадки, отсутствие заморозков). Если видишь риски (сильный ливень после внесения удобрений, заморозки после появления всходов), обязательно предупреди о них. Будь проактивным советчиком.\n${weatherContext}`;
            }

            systemInstruction += `\n\n**Правила для других тем:**
- **Анализ фото:** Если пользователь прикрепил фото, идентифицируй объект (болезнь, вредитель, сорняк). Предоставь краткое описание, оцени потенциальный вред и предложи методы борьбы (включая агротехнические и химические). Если рекомендуешь химическую обработку, укажи тип действующего вещества.
- **Вопросы о товарах:** Используй предоставленный ниже контекст о наличии, ценах и поиске запчастей. Если находишь подходящий товар, обязательно укажи его название, цену, количество в наличии и название магазина. Если информация отсутствует в контексте, вежливо сообщи об этом.
Контекст о товарах:\n${productContext}`;
            
            const contents: any[] = [{ text: `Вопрос пользователя: "${currentInput}"` }];

            if (currentImage) {
                const imageBase64 = await fileToBase64(currentImage.file);
                contents.unshift({
                    inlineData: {
                        data: imageBase64,
                        mimeType: currentImage.file.type,
                    }
                });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: contents },
                config: {
                    systemInstruction: systemInstruction,
                }
            });
            
            const text = response.text;
            const modelMessage: ChatMessage = { role: 'model', content: text.trim() };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Ошибка при вызове Gemini API:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Извините, произошла техническая ошибка. Пожалуйста, попробуйте еще раз позже." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            if(currentImage?.previewUrl) {
                URL.revokeObjectURL(currentImage.previewUrl);
            }
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <ChatMessageBubble key={index} message={msg} />
                ))}
                {loading && <LoadingBubble />}
                <div ref={messagesEndRef} />
            </div>

             {isActionSheetOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-20 flex items-end" onClick={() => setIsActionSheetOpen(false)}>
                    <div className="bg-white rounded-t-2xl w-full p-4 space-y-3 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { cameraInputRef.current?.click(); setIsActionSheetOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-4">
                            <ICONS.camera className="w-6 h-6 text-gray-700"/>
                            <span className="text-lg text-gray-800">Сделать фото</span>
                        </button>
                        <button onClick={() => { galleryInputRef.current?.click(); setIsActionSheetOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-4">
                            <ICONS.image className="w-6 h-6 text-gray-700"/>
                            <span className="text-lg text-gray-800">Выбрать из галереи</span>
                        </button>
                        <button onClick={() => setIsActionSheetOpen(false)} className="w-full text-center p-3 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 mt-2">
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-shrink-0 p-2 border-t border-gray-200 bg-gray-50 sm:p-4">
                 {selectedImage && (
                    <div className="px-2 pb-2 relative w-fit">
                        <img src={selectedImage.previewUrl} alt="Предпросмотр" className="h-20 w-20 rounded-lg object-cover" />
                        <button 
                            onClick={() => setSelectedImage(null)} 
                            className="absolute -top-1 -right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5"
                            aria-label="Удалить прикрепленное изображение"
                        >
                            <ICONS.plus className="w-4 h-4 rotate-45" />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input type="file" ref={galleryInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                    <input type="file" ref={cameraInputRef} onChange={handleImageSelect} accept="image/*" capture="environment" className="hidden" />
                    <button
                        type="button"
                        onClick={() => setIsActionSheetOpen(true)}
                        className="text-gray-500 hover:text-blue-600 p-2.5 rounded-full flex-shrink-0"
                        aria-label="Прикрепить фото"
                        disabled={loading}
                    >
                        <ICONS.paperClip className="w-5 h-5"/>
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Спросите что-нибудь..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={loading}
                        aria-label="Ваш вопрос ассистенту"
                    />
                    <button
                        type="submit"
                        disabled={loading || (!input.trim() && !selectedImage)}
                        className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        aria-label="Отправить сообщение"
                    >
                        <ICONS.send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;