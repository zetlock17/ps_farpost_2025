import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import MainPage from './components/MainPage';
// import BuildingPage from './components/BuildingPage';
import AddressPage from './components/AddressPage';
import PlaceholderPage from './components/PlaceholderPage';
import StatisticsPage from './components/StatisticsPage';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import { useMediaQuery } from './hooks/useMediaQuery';

function App() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const isMobile = useMediaQuery('(max-width: 767px)');

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<Router>
			{isMobile && <Header toggleMenu={toggleMenu} />}
			<MobileMenu isOpen={isMenuOpen} onClose={toggleMenu} />
			<Routes>
				<Route path="/" element={<MainPage />} />
				{/* <Route path="/building/" element={<BuildingPage />} /> */}
				<Route path="/address/:building_id" element={<AddressPage />} />
				<Route path="/statistics" element={<StatisticsPage />} />
				<Route path="/placeholder" element={<PlaceholderPage />} />
			</Routes>
		</Router>
	);
}

export default App;

