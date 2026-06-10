import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import SignIn from './pages/SignIn';
import TwoFactorAuth from './pages/TwoFactorAuth';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to register by default for this demo */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
