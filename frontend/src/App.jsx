import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import SignIn from './pages/SignIn';
import TwoFactorAuth from './pages/TwoFactorAuth';
import Dashboard from './pages/Dashboard';
import { hasSession } from './authApi';
import './App.css';

function AccountHome() {
  return hasSession() ? <Dashboard /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccountHome />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
