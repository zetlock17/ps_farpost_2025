import { useSearchParams } from 'react-router-dom';
import { useBlackoutsStore } from '../store/blackoutsStore';
import { useEffect } from 'react';

const BuildingPage = () => {
  const [searchParams] = useSearchParams();
  const blackoutId = searchParams.get('id');
  
  const getBlackoutById = useBlackoutsStore((state) => state.getBlackoutById);
  const fetchBlackouts = useBlackoutsStore((state) => state.fetchBlackouts);
  const blackouts = useBlackoutsStore((state) => state.blackouts);

  useEffect(() => {
    if (blackouts.length === 0) {
      fetchBlackouts();
    }
  }, [blackouts.length, fetchBlackouts]);

  const blackout = blackoutId ? getBlackoutById(blackoutId) : null;

  const typeLabels: Record<string, string> = {
    hot_water: 'Горячая вода',
    cold_water: 'Холодная вода',
    electricity: 'Электричество',
    heat: 'Отопление',
  };

  if (!blackoutId) {
    return (
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">Информация о здании</h2>
        <p className="mb-4">ID отключения не указан. Пожалуйста, выберите отключение из списка.</p>
        <a href="/" className="text-blue-600 underline">
          Вернуться на главную
        </a>
      </div>
    );
  }

  if (!blackout) {
    return (
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">Информация о здании</h2>
        <p className="mb-4">Отключение с ID "{blackoutId}" не найдено.</p>
        <a href="/" className="text-blue-600 underline">
          Вернуться на главную
        </a>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <a href="/" className="text-blue-600 underline mb-5 inline-block">
        ← Вернуться на главную
      </a>
      
      <h2 className="text-2xl font-bold mb-4">Детальная информация об отключении</h2>
      
      <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-md mt-5">
        <div className="mb-4">
          <span className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-bold">
            {typeLabels[blackout.type]}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-semibold text-gray-800">Адрес</h3>
        <p className="text-base">
          <strong>{blackout.city}</strong>, {blackout.street}, д. {blackout.building_number}
        </p>

        <h3 className="mt-5 text-xl font-semibold text-gray-800">Местоположение</h3>
        <p><strong>Район:</strong> {blackout.district}</p>
        <p><strong>Народный район:</strong> {blackout.folk_district}</p>
        <p><strong>Большой народный район:</strong> {blackout.big_folk_district}</p>
        <p><strong>Координаты:</strong> {blackout.coordinate.latitude.toFixed(6)}, {blackout.coordinate.longitude.toFixed(6)}</p>

        <h3 className="mt-5 text-xl font-semibold text-gray-800">Описание</h3>
        <p className="text-base leading-relaxed">{blackout.description}</p>

        <h3 className="mt-5 text-xl font-semibold text-gray-800">Период отключения</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Начало:</strong> {new Date(blackout.start_date).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Окончание:</strong> {new Date(blackout.end_date).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Длительность:</strong> {(() => {
            const start = new Date(blackout.start_date);
            const end = new Date(blackout.end_date);
            const diffMs = end.getTime() - start.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);
            const remainingHours = diffHours % 24;
            
            if (diffDays > 0) {
              return `${diffDays} дн. ${remainingHours} ч.`;
            }
            return `${diffHours} ч.`;
          })()}</p>
        </div>
      </div>
    </div>
  );
};

export default BuildingPage;