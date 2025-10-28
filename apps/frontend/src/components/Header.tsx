import { Menu } from 'lucide-react';
import logo from '../assets/logo.svg';
import { Link } from 'react-router-dom';


interface HeaderProps {
  toggleMenu: () => void;
}

const Header = ({ toggleMenu }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 text-white p-4 flex justify-between items-center md:hidden bg-white/50 backdrop-blur-sm">
      <Link to="/">
        <img src={logo} alt="Logo" className="h-8 w-auto -mt-2" />
      </Link>
      <button onClick={toggleMenu} className="text-black">
        <Menu className="w-6 h-6 text-black" />
      </button>
    </header>
  );
};

export default Header;