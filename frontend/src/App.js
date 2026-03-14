import React, { useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';

// Layout with active Navbar
const Layout = ({ children }) => {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold tracking-tight">ActiveCity<span className="font-light">Connect</span></h1>
        </div>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <a href="/notifications" className="hover:text-indigo-200 transition-colors flex items-center space-x-1">
                <Bell size={20} />
              </a>
              {user.role === 'citizen' ? (
                <a href="/citizen" className="hover:text-blue-200 font-medium transition-colors">Dashboard</a>
              ) : (
                <a href="/admin" className="hover:text-blue-200 font-medium transition-colors">Dashboard</a>
              )}
              <div className="flex items-center space-x-2 bg-blue-800/50 px-3 py-1 rounded-full">
                <UserIcon size={18} />
                <span className="font-medium">{user.name}</span>
                <span className="text-xs bg-white text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ml-2">
                  {user.role}
                </span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center space-x-1 hover:text-red-300 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="hover:text-blue-200 font-medium transition-colors">Login</a>
              <a href="/register" className="bg-white text-blue-600 px-4 py-2 rounded-md font-bold hover:bg-blue-50 transition-colors shadow-sm">Register</a>
            </>
          )}
        </div>
      </nav>
      <main className="container mx-auto p-4 md:p-8 flex-1">
        {children}
      </main>
    </div>
  );
};

// Wrapper specifically for layout dependency on context
const AppContent = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/citizen/*" element={<CitizenDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;