import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Info, MapPin, AlertTriangle } from 'lucide-react';
import { getAddressInfo } from '../services/addressesServices';
import { useBlackoutsStore } from '../store/blackoutsStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type { AddressInfo, BlackoutWithPrediction, NeighborBlackout } from '../types/types';

const AddressPage = () => {
  const [searchParams] = useSearchParams();
  const { building_id } = useParams();
  const selectedDate = useBlackoutsStore((state) => state.selectedDate);
  const limitNeighbors = parseInt(searchParams.get('limit_neighbors') || '5');
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddressInfo = async () => {
      if (!building_id) {
        setError('ID здания не указан');
        setLoading(false);
        return;
      }

      try {
        const data = await getAddressInfo(building_id, limitNeighbors);
        setAddressInfo(data);
      } catch (err) {
        setError('Ошибка при загрузке данных адреса');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressInfo();
  }, [building_id, selectedDate, limitNeighbors]);

  const typeLabels: Record<string, string> = {
    hot_water: 'Горячая вода',
    cold_water: 'Холодная вода',
    electricity: 'Электричество',
    heat: 'Отопление',
  };

  const renderNotFound = (message: string) => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-5">
      <h2 className="text-2xl font-bold mb-4 text-primary-black">Информация не найдена</h2>
      <p className="mb-6 text-primary-gray">{message}</p>
      <a 
        href="/" 
        className="inline-flex items-center px-4 py-2 bg-[#F97D41] text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться на главную
      </a>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97D41] mx-auto mb-4"></div>
          <p className="text-primary-gray">Загрузка информации об адресе...</p>
        </div>
      </div>
    );
  }

  if (error || !addressInfo) {
    return renderNotFound(error || 'Информация об адресе не найдена');
  }

  const hasBlackouts = addressInfo.blackouts && addressInfo.blackouts.length > 0;
  const hasNeighborBlackouts = addressInfo.neighbor_blackouts && addressInfo.neighbor_blackouts.length > 0;

  return (
    <div className={`bg-primary-gray min-h-screen ${isMobile ? 'pt-16' : ''}`}>
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <a 
          href="/" 
          className="inline-flex items-center text-[#F97D41] font-semibold mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Вернуться на главную
        </a>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-black mb-6">
              Информация об адресе
            </h2>
            {hasBlackouts && (
              <div className="mb-4">
                <p className="text-primary-gray">
                  <strong>Адрес:</strong> {addressInfo.blackouts[0].city}, {addressInfo.blackouts[0].street}, д. {addressInfo.blackouts[0].building_number}
                </p>
              </div>
            )}
          </div>
        </div>

        {hasBlackouts && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-primary-black mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-[#F97D41]" />
                Отключения по этому адресу
              </h3>
              <div className="space-y-4">
                {addressInfo.blackouts.map((blackout: BlackoutWithPrediction) => (
                  <div key={blackout.id} className="border border-primary-gray rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <span className="px-3 py-1 bg-[#F97D41] text-white rounded-full text-sm font-bold self-start sm:self-center mb-2 sm:mb-0">
                        {typeLabels[blackout.type]}
                      </span>
                      {/* <div className="text-sm text-primary-gray">
                        ID: {blackout.id}
                      </div> */}
                    </div>
                    <p className="text-primary-black mb-3">{blackout.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Начало:</strong> {new Date(blackout.start_date).toLocaleString('ru-RU')}
                      </div>
                      <div>
                        <strong>Окончание:</strong> {new Date(blackout.end_date).toLocaleString('ru-RU')}
                      </div>
                      <div>
                        <strong>Прогноз окончания:</strong> {new Date(blackout.predicted_end_date).toLocaleString('ru-RU')}
                      </div>
                      <div>
                        <strong>Длительность:</strong> {(() => {
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
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasNeighborBlackouts && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-primary-black mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-[#F97D41]" />
                Отключения у соседей
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addressInfo.neighbor_blackouts.map((neighbor: NeighborBlackout, index: number) => (
                  <Link
                    key={index}
                    to={`/address/${neighbor.building_id}`}
                    className="border border-primary-gray rounded-lg p-4 hover:shadow-md transition-shadow block"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-primary-gray text-primary-black rounded text-xs font-medium">
                        {typeLabels[neighbor.type]}
                      </span>
                    </div>
                    <p className="text-primary-black font-medium">{neighbor.street}, д. {neighbor.building}</p>
                    <p className="text-sm text-primary-gray">ID здания: {neighbor.building_id}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {!hasBlackouts && !hasNeighborBlackouts && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <Info className="w-12 h-12 text-primary-gray mx-auto mb-4" />
              <p className="text-primary-gray">По этому адресу и у соседей отключений не найдено.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressPage;