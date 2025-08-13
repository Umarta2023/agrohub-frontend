
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

const API_KEY = 'ba915e5a9efdfcd2c4b3c4ffb8214deb';

// Helper function to map OWM weather condition ID to our ICONS
const getWeatherIconName = (weatherId: number): keyof typeof ICONS => {
    if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
    if (weatherId >= 300 && weatherId < 500) return 'rain';
    if (weatherId >= 500 && weatherId < 600) return 'rain';
    if (weatherId >= 600 && weatherId < 700) return 'snow';
    if (weatherId >= 700 && weatherId < 800) return 'mist';
    if (weatherId === 800) return 'sun';
    if (weatherId > 800) return 'cloud';
    return 'sun'; // default
};

const WeatherIcon: React.FC<{ weatherId: number, className?: string }> = ({ weatherId, className }) => {
    const Icon = ICONS[getWeatherIconName(weatherId)] || ICONS.sun;
    return <Icon className={className} />;
};

const AgroWeather: React.FC = () => {
    const [weatherData, setWeatherData] = useState<{ current: any; hourly: any[]; daily: any[] } | null>(null);
    const [locationName, setLocationName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processForecastData = (forecastList: any[]) => {
            const dailyData: { [key: string]: { temps: number[], icons: { [key: number]: number }, dateObj: Date } } = {};
            forecastList.forEach(item => {
                const date = new Date(item.dt * 1000).toLocaleDateString('ru-RU');
                if (!dailyData[date]) {
                    dailyData[date] = { temps: [], icons: {}, dateObj: new Date(item.dt * 1000) };
                }
                dailyData[date].temps.push(item.main.temp);
                const weatherId = item.weather[0].id;
                dailyData[date].icons[weatherId] = (dailyData[date].icons[weatherId] || 0) + 1;
            });
    
            return Object.values(dailyData).map(day => {
                const mostFrequentIconId = parseInt(Object.keys(day.icons).reduce((a, b) => day.icons[parseInt(a)] > day.icons[parseInt(b)] ? a : b));
                return {
                    date: day.dateObj,
                    high: Math.round(Math.max(...day.temps)),
                    low: Math.round(Math.min(...day.temps)),
                    weatherId: mostFrequentIconId,
                };
            }).slice(0, 5);
        };

        const fetchWeather = async (lat: number, lon: number) => {
            setLoading(true);
            setError(null);
            
            if (!API_KEY) {
                setError("Ключ API для погоды не настроен.");
                setLoading(false);
                return;
            }

            try {
                const weatherPromise = fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${API_KEY}`);
                const forecastPromise = fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${API_KEY}`);
                
                const [weatherResponse, forecastResponse] = await Promise.all([weatherPromise, forecastPromise]);

                if (!weatherResponse.ok) throw new Error(`Ошибка ${weatherResponse.status}: Не удалось получить текущую погоду.`);
                if (!forecastResponse.ok) throw new Error(`Ошибка ${forecastResponse.status}: Не удалось получить прогноз.`);

                const current = await weatherResponse.json();
                const forecast = await forecastResponse.json();
                
                setWeatherData({
                    current,
                    hourly: forecast.list.slice(0, 8), // Next 24 hours (8 * 3h)
                    daily: processForecastData(forecast.list)
                });
                setLocationName(current.name);

            } catch (e: any) {
                console.error("Weather fetch error:", e);
                setError(e.message || "Не удалось загрузить данные о погоде.");
            } finally {
                setLoading(false);
            }
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            () => {
                setError('Не удалось получить геолокацию. Проверьте разрешения. Загружаем погоду для Краснодара.');
                fetchWeather(45.035470, 38.975313); // Fallback to Krasnodar
            }
        );
    }, []);

    const formatDay = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        if (date.getDate() === today.getDate()) return 'Сегодня';
        if (date.getDate() === tomorrow.getDate()) return 'Завтра';
        return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="p-4">
            <div className="flex items-center mb-6">
                <Link to="/info" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Детальный агропрогноз</h1>
            </div>

            {loading && (
                <div className="text-center py-20">
                    <p className="text-gray-500">Загрузка данных о погоде...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Ошибка</p>
                    <p>{error}</p>
                </div>
            )}

            {weatherData && !loading && !error && (
                <div className="space-y-6">
                    {/* Current Conditions */}
                    <div className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg text-center">
                        <p className="font-medium">{locationName || 'Ваше местоположение'}</p>
                        <div className="flex items-center justify-center gap-4 my-2">
                            <WeatherIcon weatherId={weatherData.current.weather[0].id} className="w-20 h-20"/>
                            <div>
                                <p className="text-6xl font-bold">{Math.round(weatherData.current.main.temp)}°</p>
                                <p className="text-xl capitalize">{weatherData.current.weather[0].description}</p>
                            </div>
                        </div>
                        <p>Ощущается как {Math.round(weatherData.current.main.feels_like)}°</p>
                    </div>

                    {/* Additional Data */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Дополнительные показатели</h2>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-500">Влажность</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{weatherData.current.main.humidity}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ветер</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{weatherData.current.wind.speed.toFixed(1)} м/с</p>
                            </div>
                        </div>
                    </div>

                    {/* Hourly Forecast */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Прогноз по часам</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {weatherData.hourly.map((hour: any) => (
                                <div key={hour.dt} className="flex-shrink-0 text-center space-y-2 p-2 rounded-lg hover:bg-gray-100 min-w-[60px]">
                                    <p className="text-sm font-medium text-gray-600">{new Date(hour.dt * 1000).getHours()}:00</p>
                                    <WeatherIcon weatherId={hour.weather[0].id} className="w-8 h-8 mx-auto text-sky-500"/>
                                    <p className="text-lg font-bold text-gray-800">{Math.round(hour.main.temp)}°</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Forecast */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Прогноз на 5 дней</h2>
                        <div className="space-y-3">
                            {weatherData.daily.map((day: any) => (
                                <div key={day.date.toISOString()} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                                    <p className="font-medium text-gray-700 w-1/3">{formatDay(day.date)}</p>
                                    <WeatherIcon weatherId={day.weatherId} className="w-7 h-7 text-yellow-500"/>
                                    <div className="font-medium text-right w-1/3">
                                        <span className="text-gray-800">{day.high}°</span>
                                        <span className="text-gray-400 ml-2">{day.low}°</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgroWeather;