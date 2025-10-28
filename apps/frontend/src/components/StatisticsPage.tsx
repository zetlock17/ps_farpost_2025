
import BlackoutsStats from './BlackoutsStats';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';


const StatisticsPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  return (
    <div className="p-4 pt-20 md:pt-4">
      {isMobile && (
        <button
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-orange-500 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Назад</span>
        </button>
      )}
      <h1 className="text-2xl font-bold mb-4">Статистика отключений</h1>
      <BlackoutsStats />
    </div>
  );
};

export default StatisticsPage;
