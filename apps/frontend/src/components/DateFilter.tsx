import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useBlackoutsStore } from '../store/blackoutsStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DateFilter = () => {
    const selectedDate = useBlackoutsStore((state) => state.selectedDate);
    const setDateFilter = useBlackoutsStore((state) => state.setDateFilter);

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        setDateFilter(date);
    };

    const handlePrevDay = () => {
        if (selectedDate) {
            setDateFilter(selectedDate.subtract(1, 'day'));
        }
    };

    const handleNextDay = () => {
        if (selectedDate) {
            setDateFilter(selectedDate.add(1, 'day'));
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">Фильтр по дате</h3>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handlePrevDay} 
                    className="p-2 rounded-md hover:bg-primary-gray transition-colors"
                    aria-label="Предыдущий день"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <DatePicker 
                    onChange={handleDateChange} 
                    value={selectedDate}
                    placeholder="Выберите дату"
                    style={{ width: '100%' }}
                    allowClear={false}
                />
                <button 
                    onClick={handleNextDay} 
                    className="p-2 rounded-md hover:bg-primary-gray transition-colors"
                    aria-label="Следующий день"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default DateFilter;
