import type { FC } from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose}>
      <div
        className="fixed top-0 left-0 w-64 h-full bg-gray-800 p-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="flex flex-col space-y-4">
          <Link to="/" className="text-white" onClick={onClose}>
            Карта отключений
          </Link>
          <Link to="/statistics" className="text-white" onClick={onClose}>
            Статистика
          </Link>
          <Link to="/building" className="text-white" onClick={onClose}>
            Информация о здании
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
