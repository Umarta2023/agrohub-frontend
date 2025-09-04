import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { area as turfArea } from '@turf/area';
import { polygon as turfPolygon } from '@turf/helpers';
import { useCreateField } from '../hooks/useCreateField'; // <-- ИЗМЕНЕНИЕ №1: Новый хук
import { ICONS } from '../constants';

// Tell TypeScript that L exists in the global scope, loaded from a <script> tag.
declare const L: any;

const AddField: React.FC = () => {
    const { mutate: createField } = useCreateField(); // <-- ИЗМЕНЕНИЕ №2: Используем новый хук
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [currentCrop, setCurrentCrop] = useState('');
    const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    // New GPS states
    const [isGpsTracking, setIsGpsTracking] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    const mapRef = useRef<any | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const drawnItemsRef = useRef<any | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const gpsTrackLayerRef = useRef<any | null>(null);
    const userMarkerRef = useRef<any | null>(null);


    const calculatedArea = useMemo(() => {
        if (polygonPoints.length < 3) return 0;
        // Turf requires the first and last positions to be the same to close the polygon
        const turfPoints = [...polygonPoints, polygonPoints[0]];
        const poly = turfPolygon([turfPoints]);
        const areaInMeters = turfArea(poly);
        const areaInHectares = areaInMeters / 10000;
        return parseFloat(areaInHectares.toFixed(2));
    }, [polygonPoints]);

     // Fullscreen handlers
    const handleToggleFullScreen = () => {
        if (!mapWrapperRef.current) return;

        if (!document.fullscreenElement) {
            mapWrapperRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    // Effect for fullscreen state sync
    useEffect(() => {
        const onFullScreenChange = () => {
            const isCurrentlyFullScreen = !!document.fullscreenElement;
            setIsFullScreen(isCurrentlyFullScreen);
            // Give the browser a moment to reflow before invalidating map size
            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 150);
        };
        document.addEventListener('fullscreenchange', onFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFullScreenChange);
        };
    }, []);
    
    // Effect for map initialization and leaflet-draw integration
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [45.035470, 38.975313], // Center on Krasnodar
                zoom: 13,
            });
            
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });

            const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });

            satelliteLayer.addTo(map);

            const baseMaps = {
                "Спутник": satelliteLayer,
                "Схема": streetLayer
            };

            L.control.layers(baseMaps).addTo(map);
            mapRef.current = map;

            // --- Leaflet Draw Integration ---
            const drawnItems = new L.FeatureGroup();
            drawnItemsRef.current = drawnItems;
            map.addLayer(drawnItems);

            const drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems,
                    poly: {
                        allowIntersection: false
                    }
                },
                draw: {
                    polygon: {
                        allowIntersection: false,
                        showArea: true,
                        shapeOptions: {
                            color: '#fbbf24'
                        }
                    },
                    polyline: false,
                    rectangle: false,
                    circle: false,
                    marker: false,
                    circlemarker: false,
                }
            });
            map.addControl(drawControl);

            map.on('draw:created', (e: any) => {
                const layer = e.layer;
                drawnItems.clearLayers(); // Allow only one polygon
                drawnItems.addLayer(layer);

                const latlngs = layer.getLatLngs()[0];
                const points = latlngs.map((p: any) => [p.lng, p.lat]);
                setPolygonPoints(points);
            });

            map.on('draw:edited', (e: any) => {
                e.layers.eachLayer((layer: any) => {
                    const latlngs = layer.getLatLngs()[0];
                    const points = latlngs.map((p: any) => [p.lng, p.lat]);
                    setPolygonPoints(points);
                });
            });

            map.on('draw:deleted', () => {
                setPolygonPoints([]);
            });
        }

        return () => {
            if (mapRef.current) {
                if ((mapRef.current as any)._container) {
                     mapRef.current.remove();
                }
                mapRef.current = null;
            }
        };
    }, []);

    const handleToggleGpsTracking = () => {
        const map = mapRef.current;
        if (!map) return;

        if (isGpsTracking) {
            // Stop tracking
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }

            if (gpsTrackLayerRef.current) {
                const latlngs = gpsTrackLayerRef.current.getLatLngs();
                if (latlngs.length > 2) {
                    const points = latlngs.map((p: any) => [p.lng, p.lat] as [number, number]);
                    
                    if (drawnItemsRef.current) {
                        drawnItemsRef.current.clearLayers();
                        const newPolygon = L.polygon(latlngs, { color: '#fbbf24' });
                        drawnItemsRef.current.addLayer(newPolygon);
                        setPolygonPoints(points);
                    }
                }
                map.removeLayer(gpsTrackLayerRef.current);
                gpsTrackLayerRef.current = null;
            }

            if (userMarkerRef.current) {
                map.removeLayer(userMarkerRef.current);
                userMarkerRef.current = null;
            }
            
            setIsGpsTracking(false);

        } else {
            // Start tracking
            if (!navigator.geolocation) {
                setGpsError("Геолокация не поддерживается вашим браузером.");
                return;
            }
            
            setGpsError(null);
            setIsGpsTracking(true);

            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const latlng = L.latLng(latitude, longitude);

                    map.setView(latlng, 18);
                    
                    if (!userMarkerRef.current) {
                        userMarkerRef.current = L.marker(latlng).addTo(map);
                    } else {
                        userMarkerRef.current.setLatLng(latlng);
                    }

                    if (!gpsTrackLayerRef.current) {
                        gpsTrackLayerRef.current = L.polyline([], { color: 'red', weight: 3, opacity: 0.7 }).addTo(map);
                    }
                    gpsTrackLayerRef.current.addLatLng(latlng);
                },
                (error) => {
                    let message = "Произошла ошибка геолокации.";
                    if (error.code === error.PERMISSION_DENIED) message = "Вы запретили доступ к геолокации.";
                    else if (error.code === error.POSITION_UNAVAILABLE) message = "Информация о местоположении недоступна.";
                    else if (error.code === error.TIMEOUT) message = "Истекло время ожидания запроса геолокации.";
                    setGpsError(message);
                    setIsGpsTracking(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    };

    // GPS Cleanup Effect
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !currentCrop) {
            alert('Пожалуйста, заполните название поля и культуру.');
            return;
        }
        if (polygonPoints.length < 3) {
            alert('Пожалуйста, нарисуйте контур поля.');
            return;
        }
        
        // <-- ИЗМЕНЕНИЕ №3: Вызываем мутацию
        createField({
            name,
            area: calculatedArea,
            currentCrop,
            polygon: polygonPoints,
            // Добавляем заглушку для imageUrl, если поле обязательное на бэкенде
            imageUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/9/188/321'
        }, {
            onSuccess: () => {
                // Перенаправляем на страницу полей только после успешного создания
                navigate('/my-fields');
            }
        });
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || !mapRef.current) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 13);
            } else {
                alert('Место не найдено. Попробуйте другой запрос.');
            }
        } catch (error) {
            console.error("Ошибка при поиске местоположения:", error);
            alert('Произошла ошибка при поиске.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="p-4">
             <div className={`flex items-center mb-6 ${isFullScreen ? 'hidden' : ''}`}>
                <Link to="/my-fields" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Добавить новое поле</h1>
            </div>

            <div 
                ref={mapWrapperRef}
                className={`bg-white rounded-xl shadow-md space-y-4 
                    ${isFullScreen ? 'fixed inset-0 z-50 p-0 rounded-none' : 'p-4'}`
                }
            >
                <form onSubmit={handleSearch} className={`flex gap-2 ${isFullScreen ? 'hidden' : ''}`}>
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Найти город или село..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={isSearching} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-300 transition-colors">
                        {isSearching ? 'Поиск...' : <ICONS.search className="w-5 h-5"/>}
                    </button>
                </form>

                <div className={`relative ${isFullScreen ? 'w-full h-full' : 'w-full h-64 md:h-80'}`}>
                    <div 
                        ref={mapContainerRef}
                        className="w-full h-full rounded-lg overflow-hidden bg-gray-200"
                        aria-label="Интерактивная карта для рисования контура поля"
                    />
                     <button 
                        type="button"
                        onClick={handleToggleFullScreen}
                        className="absolute top-3 right-3 z-[1000] bg-white p-2 rounded-md shadow-lg text-gray-700 hover:bg-gray-100"
                        aria-label="Переключить полноэкранный режим"
                    >
                        {isFullScreen ? <ICONS.fullscreenExit className="w-5 h-5"/> : <ICONS.fullscreenEnter className="w-5 h-5"/>}
                    </button>
                </div>
                
                <div className={`pt-4 border-t ${isFullScreen ? 'hidden' : ''}`}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Замер по GPS</h3>
                    <p className="text-xs text-gray-500 mb-3">Начните замер и обойдите поле по периметру. Приложение запишет ваш трек.</p>
                    <button
                        type="button"
                        onClick={handleToggleGpsTracking}
                        className={`w-full font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            isGpsTracking 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        disabled={isFullScreen}
                    >
                        <ICONS.gps className="w-5 h-5"/>
                        <span>{isGpsTracking ? 'Завершить замер' : 'Начать замер по GPS'}</span>
                    </button>
                    {isGpsTracking && <p className="text-center text-sm text-indigo-700 mt-2 animate-pulse">Идет запись трека...</p>}
                    {gpsError && <p className="text-red-500 text-sm mt-2">{gpsError}</p>}
                </div>
                
                <form onSubmit={handleSubmit} className={`space-y-4 pt-4 border-t ${isFullScreen ? 'hidden' : ''}`}>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <label className="block text-sm font-medium text-blue-800">Расчетная площадь</label>
                        <p className="text-2xl font-bold text-blue-600">{calculatedArea} га</p>
                    </div>
                    <div>
                        <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700">Название поля</label>
                        <input type="text" id="fieldName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр., Поле у реки" className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
                    </div>
                     <div>
                        <label htmlFor="currentCrop" className="block text-sm font-medium text-gray-700">Текущая или планируемая культура</label>
                        <input type="text" id="currentCrop" value={currentCrop} onChange={(e) => setCurrentCrop(e.target.value)} placeholder="Напр., Озимая пшеница" className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Сохранить поле
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddField;