import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { area as turfArea } from '@turf/area';
import { polygon as turfPolygon } from '@turf/helpers';
import { ICONS } from '../constants';
import { useGetFieldById } from '../hooks/useGetFieldById';
import { useUpdateField } from '../hooks/useUpdateField';


// Tell TypeScript that L exists in the global scope, loaded from a <script> tag.
declare const L: any;

const EditField: React.FC = () => {
    const { fieldId } = useParams<{ fieldId: string }>();
    const navigate = useNavigate();
    
    // --- Получаем реальные данные ---
    const numericFieldId = fieldId ? parseInt(fieldId, 10) : undefined;
    const { data: field, isLoading } = useGetFieldById(numericFieldId);
    const { mutate: updateField } = useUpdateField();

    // --- Состояния формы и UI ---
    const [name, setName] = useState('');
    const [currentCrop, setCurrentCrop] = useState('');
    const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isGpsTracking, setIsGpsTracking] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    
    // --- Refs ---
    const mapRef = useRef<any | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const drawnItemsRef = useRef<any | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const gpsTrackLayerRef = useRef<any | null>(null);
    const userMarkerRef = useRef<any | null>(null);

    useEffect(() => {
        if (field) {
            setName(field.name);
            setCurrentCrop(field.currentCrop);
            setPolygonPoints(field.polygon || []);
        }
    }, [field]);

    const calculatedArea = useMemo(() => {
        if (polygonPoints.length < 3) return 0;
        const turfPoints = [...polygonPoints, polygonPoints[0]];
        const poly = turfPolygon([turfPoints]);
        const areaInMeters = turfArea(poly);
        const areaInHectares = areaInMeters / 10000;
        return parseFloat(areaInHectares.toFixed(2));
    }, [polygonPoints]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!numericFieldId || !name || !currentCrop) {
            alert('Пожалуйста, заполните название поля и культуру.');
            return;
        }
        if (polygonPoints.length < 3) {
            alert('Пожалуйста, нарисуйте или обновите контур поля.');
            return;
        }
        updateField({
            fieldId: numericFieldId,
            fieldData: {
                name,
                area: calculatedArea,
                currentCrop,
                polygon: polygonPoints,
            }
        }, {
            onSuccess: () => {
                navigate(`/field/${numericFieldId}`);
            }
        });
    };
    
    // ... остальной код (Карта, GPS, Fullscreen) без изменений ...
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
    
    useEffect(() => {
        const onFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
            setTimeout(() => mapRef.current?.invalidateSize(), 150);
        };
        document.addEventListener('fullscreenchange', onFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
    }, []);
    
    useEffect(() => {
        if (isLoading || !mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView([45.035, 38.975], 10);
        mapRef.current = map;
        
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);

        const drawnItems = new L.FeatureGroup();
        drawnItemsRef.current = drawnItems;
        map.addLayer(drawnItems);
        
        if (field?.polygon && field.polygon.length > 2) {
            const leafletCoords = field.polygon.map(p => [p[1], p[0]] as [number, number]);
            const initialPolygon = L.polygon(leafletCoords);
            drawnItems.addLayer(initialPolygon);
            map.fitBounds(initialPolygon.getBounds());
        }

        const drawControl = new L.Control.Draw({
            edit: { featureGroup: drawnItems, poly: { allowIntersection: false } },
            draw: {
                polygon: { allowIntersection: false, showArea: true, shapeOptions: { color: '#fbbf24' } },
                polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false,
            }
        });
        map.addControl(drawControl);

        map.on('draw:created', (e: any) => {
            const layer = e.layer;
            drawnItems.clearLayers();
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
        map.on('draw:deleted', () => setPolygonPoints([]));
    
        return () => {
             if (mapRef.current) mapRef.current.remove();
             mapRef.current = null;
        };
    }, [isLoading, field]);

    const handleToggleGpsTracking = () => {
        const map = mapRef.current;
        if (!map) return;

        if (isGpsTracking) {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            if (gpsTrackLayerRef.current) {
                const latlngs = gpsTrackLayerRef.current.getLatLngs();
                if (latlngs.length > 2) {
                    const points = latlngs.map((p: any) => [p.lng, p.lat] as [number, number]);
                    if (drawnItemsRef.current) {
                        drawnItemsRef.current.clearLayers();
                        drawnItemsRef.current.addLayer(L.polygon(latlngs, { color: '#fbbf24' }));
                        setPolygonPoints(points);
                    }
                }
                map.removeLayer(gpsTrackLayerRef.current);
                gpsTrackLayerRef.current = null;
            }
            if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
            setIsGpsTracking(false);
        } else {
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
                    setGpsError(message);
                    setIsGpsTracking(false);
                },
                { enableHighAccuracy: true }
            );
        }
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    if (isLoading) {
        return <div className="text-center p-10">Загрузка данных поля...</div>;
    }

    if (!field) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-red-500">Поле не найдено</h1>
                <Link to="/my-fields" className="mt-4 inline-block text-blue-600 hover:underline">
                    Вернуться к списку полей
                </Link>
            </div>
        );
    }
    
    return (
        <div className="p-4">
             <div className={`flex items-center mb-6 ${isFullScreen ? 'hidden' : ''}`}>
                <Link to={`/field/${fieldId}`} className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Редактировать поле</h1>
            </div>

            <div 
                ref={mapWrapperRef}
                className={`bg-white rounded-xl shadow-md space-y-4 
                    ${isFullScreen ? 'fixed inset-0 z-50 p-0 rounded-none' : 'p-4'}`
                }
            >
                <div className={`relative ${isFullScreen ? 'w-full h-full' : 'w-full h-64 md:h-80'}`}>
                    <div ref={mapContainerRef} className="w-full h-full rounded-lg overflow-hidden bg-gray-200" />
                    <button 
                        type="button"
                        onClick={handleToggleFullScreen}
                        className="absolute top-3 right-3 z-[1000] bg-white p-2 rounded-md shadow-lg text-gray-700 hover:bg-gray-100"
                    >
                        {isFullScreen ? <ICONS.fullscreenExit className="w-5 h-5"/> : <ICONS.fullscreenEnter className="w-5 h-5"/>}
                    </button>
                </div>
                
                <div className={`pt-4 border-t ${isFullScreen ? 'hidden' : ''}`}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Замер по GPS</h3>
                    <p className="text-xs text-gray-500 mb-3">Начните замер для перезаписи контура поля.</p>
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
                        <input type="text" id="fieldName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
                    </div>
                     <div>
                        <label htmlFor="currentCrop" className="block text-sm font-medium text-gray-700">Текущая или планируемая культура</label>
                        <input type="text" id="currentCrop" value={currentCrop} onChange={(e) => setCurrentCrop(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Сохранить изменения
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditField;