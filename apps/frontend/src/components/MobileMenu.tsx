import type { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Bell,
  Gauge,
  Users,
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    id: 'stats',
    title: 'Статистика',
    icon: <BarChart2 className="h-5 w-5" />,
    path: '/statistics',
  },
  {
    id: 'meter-readings',
    title: 'Показания счетчиков',
    icon: <Gauge className="h-5 w-5" />,
    path: '/placeholder',
    state: { title: 'Показания счетчиков' },
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    icon: <Bell className="h-5 w-5" />,
    path: '/placeholder',
    state: { title: 'Уведомления' },
  },
  {
    id: 'management-companies',
    title: 'Управляющие компании',
    icon: <Users className="h-5 w-5" />,
    path: '/placeholder',
    state: { title: 'Управляющие компании' },
  },
];

const MobileMenu: FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
      onClick={onClose}
    >
      <div
        className="fixed top-0 left-0 w-64 h-full bg-white p-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="flex flex-col space-y-2 pt-4">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              state={item.state}
              className="flex items-center gap-3 rounded-md p-2 text-base font-medium text-primary-black hover:bg-primary-gray"
              onClick={onClose}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
