import { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-gray-800/50 text-white p-4 flex justify-between items-center md:hidden">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold">
          Logo
        </Link>
      </div>
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>
      <MobileMenu isOpen={isMenuOpen} onClose={toggleMenu} />
    </header>
  );
};

export default Header;