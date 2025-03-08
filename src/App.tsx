import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import AdminDashboard from "./pages/AdminDashboard"
import AmbassadorDashboard from "./pages/AmbassadorDashboard"

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/ambassador" element={<AmbassadorDashboard />} />
      </Routes>
    </Router>
  )
}

export default App

