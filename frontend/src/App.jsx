import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Appointment from './pages/Appointment';
import MyAppointments from './pages/MyAppointments';
import AdminPanel from './pages/AdminPanel'; // YENİ EKLENDİ

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/randevu" element={<Appointment />} />
        <Route path="/randevularim" element={<MyAppointments />} />
        <Route path="/admin" element={<AdminPanel />} /> {/* YENİ EKLENDİ */}
      </Routes>
    </Router>
  );
}

export default App;