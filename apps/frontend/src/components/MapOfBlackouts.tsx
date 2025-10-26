import { useBlackoutsStore } from "../store/blackoutsStore";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";

interface MapOfBlackoutsProps {
  variant?: "default" | "fullscreen";
  showViewToggle?: boolean;
  className?: string;
}

declare global {
  interface Window {
    ymaps: {
      ready: (callback: () => void) => void;
      Map: new (container: HTMLElement | null, options: {
        center: number[];
        zoom: number;
        controls: string[];
      }) => YandexMap;
      Placemark: new (
        coordinates: number[],
        properties: Record<string, string>,
        options: Record<string, string>
      ) => unknown;
    };
  }
}

interface YandexMap {
  geoObjects: {
    removeAll: () => void;
    add: (placemark: unknown) => void;
    getBounds: () => number[][];
  };
  setBounds: (bounds: number[][], options: { checkZoomRange: boolean; zoomMargin: number }) => void;
  events: {
    add: (event: string, callback: (e: { get: (name: string) => unknown }) => void) => void;
  };
  balloon: {
    close: () => void;
    isOpen: () => boolean;
  };
}

const MapOfBlackouts = ({
  variant = "default",
  showViewToggle = true,
  className = "",
}: MapOfBlackoutsProps) => {
  const filteredBlackouts = useBlackoutsStore((state) => state.filteredBlackouts);
  const isLoading = useBlackoutsStore((state) => state.isLoading);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YandexMap | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const typeLabels: Record<string, string> = useMemo(() => ({
    hot_water: 'Горячая вода',
    cold_water: 'Холодная вода',
    electricity: 'Электричество',
    heat: 'Отопление',
  }), []);

  const typeColors: Record<string, string> = useMemo(() => ({
    hot_water: '#ff6b6b',
    cold_water: '#4dabf7',
    electricity: '#ffd43b',
    heat: '#ff8787',
  }), []);

  useEffect(() => {
    if (!showViewToggle && viewMode !== 'map') {
      setViewMode('map');
    }
  }, [showViewToggle, viewMode]);

  const isFullscreen = variant === 'fullscreen';
  const shouldRenderMap = isFullscreen || viewMode === 'map';

  useEffect(() => {
    if (!mapRef.current || !shouldRenderMap) return;

    const initMap = () => {
      if (!window.ymaps) {
        console.error('Yandex Maps API не загружен');
        return;
      }

      window.ymaps.ready(() => {
        // Создаем карту с центром во Владивостоке
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
            center: [43.1155, 131.8855], // Владивосток
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
          });

          mapInstanceRef.current.events.add('click', () => {
            if (mapInstanceRef.current?.balloon.isOpen()) {
              mapInstanceRef.current.balloon.close();
            }
          });
        }

        // Очищаем старые метки
        mapInstanceRef.current.geoObjects.removeAll();

        // Добавляем метки для каждого отключения
        filteredBlackouts.forEach((blackout) => {
          if (blackout.coordinate?.latitude && blackout.coordinate?.longitude) {
            const placemark = new window.ymaps.Placemark(
              [blackout.coordinate.latitude, blackout.coordinate.longitude],
              {
                balloonContentHeader: `<strong>${typeLabels[blackout.type]}</strong>`,
                balloonContentBody: `
                  <div style="padding: 10px;">
                    <p><strong>${blackout.street}, ${blackout.building_number}</strong></p>
                    <p style="margin: 5px 0;">${blackout.description}</p>
                    <p style="font-size: 12px; color: #666;">
                      🕐 ${new Date(blackout.start_date).toLocaleDateString('ru-RU')} - 
                      ${new Date(blackout.end_date).toLocaleDateString('ru-RU')}
                    </p>
                    <a href="/building/?id=${blackout.id}" style="color: #007bff; text-decoration: none;">
                      Подробнее →
                    </a>
                  </div>
                `,
                hintContent: `${blackout.street}, ${blackout.building_number}`
              },
              {
                preset: 'islands#circleIcon',
                iconColor: typeColors[blackout.type],
                balloonRadius: '10'
              }
            );

            mapInstanceRef.current!.geoObjects.add(placemark);
          }
        });

        // Автоматически подстраиваем масштаб карты под все метки
        if (filteredBlackouts.length > 0 && mapInstanceRef.current) {
          mapInstanceRef.current.setBounds(
            mapInstanceRef.current.geoObjects.getBounds(),
            { checkZoomRange: true, zoomMargin: 50 }
          );
        }
      });
    };

    initMap();
  }, [filteredBlackouts, shouldRenderMap, typeLabels, typeColors]);

  if (isFullscreen) {
    return (
      <div className={`relative h-full w-full ${className}`}>
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/70 text-white">
            <span className="mb-3 inline-block h-10 w-10 animate-spin rounded-full border-4 border-white/40 border-t-white" />
            <span className="text-sm font-medium">Загрузка карты...</span>
          </div>
        )}
        <div
          ref={mapRef}
          className="h-full w-full"
          style={{ width: '100%', height: '100%' }}
        />
        {!isLoading && filteredBlackouts.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center text-white drop-shadow">
            Нет отключений для отображения
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-5 text-center">Загрузка карты...</div>;
  }

  return (
    <div className={`p-5 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Карта отключений</h2>
        {showViewToggle && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded ${viewMode === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              🗺️ Карта
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              📋 Список
            </button>
          </div>
        )}
      </div>

      {shouldRenderMap ? (
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '600px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mt-5">
          {filteredBlackouts.map((blackout) => (
            <Link 
              key={blackout.id}
              to={`/building/?id=${blackout.id}`}
              className="no-underline text-inherit"
            >
              <div 
                className="p-4 bg-white rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ border: `3px solid ${typeColors[blackout.type]}` }}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span 
                    className="px-2 py-1 text-white rounded text-xs font-bold"
                    style={{ background: typeColors[blackout.type] }}
                  >
                    {typeLabels[blackout.type]}
                  </span>
                  <span className="text-xs text-gray-600">
                    {blackout.district}
                  </span>
                </div>
                
                <p className="my-1.5 font-bold text-sm">
                  {blackout.street}, {blackout.building_number}
                </p>
                
                <p className="my-2.5 text-[13px] text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                  {blackout.description}
                </p>
                
                <div className="mt-2.5 text-xs text-gray-500">
                  <div>📍 {blackout.folk_district}</div>
                  <div className="mt-1.5">
                    🕐 {new Date(blackout.start_date).toLocaleDateString('ru-RU')} - {new Date(blackout.end_date).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredBlackouts.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          Нет отключений для отображения
        </div>
      )}
    </div>
  );
};

export default MapOfBlackouts;