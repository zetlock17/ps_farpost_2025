import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from "./components/MainPage"
import BuildingPage from './components/BuildingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/building/" element={<BuildingPage />} />
      </Routes>
    </Router>
  )
}

export default App

