import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from "./components/MainPage"
import BuildingPage from './components/BuildingPage'
import PlaceholderPage from "./components/PlaceholderPage";
import StatisticsPage from './components/StatisticsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/building/" element={<BuildingPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/placeholder" element={<PlaceholderPage />} />
      </Routes>
    </Router>
  )
}

export default App

