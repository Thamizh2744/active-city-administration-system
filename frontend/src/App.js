import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MunicipalNgoDashboard from './pages/MunicipalNgoDashboard';
import Notifications from './pages/Notifications';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';

const getDashboardPath = (role) => {
  switch (role) {
    case 'citizen':       return '/citizen';
    case 'administrator': return '/admin';
    case 'municipal':     return '/municipal';
    case 'ngo':           return '/ngo';
    default:              return '/login';
  }
};

// Layout with active Navbar
const Layout = ({ children }) => {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="flex flex-wrap justify-between items-center gap-y-2 px-4 py-3">
          {/* Brand */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight whitespace-nowrap">
              ActiveCity<span className="font-light">Connect</span>
            </h1>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {user ? (
              <>
                {/* Bell */}
                <a
                  href="/notifications"
                  className="hover:text-indigo-200 transition-colors flex items-center"
                  title="Notifications"
                >
                  <Bell size={20} />
                </a>

                {/* Dashboard link — hidden on very small screens */}
                <a
                  href={getDashboardPath(user.role)}
                  className="hidden xs:inline hover:text-blue-200 font-medium transition-colors text-sm"
                >
                  Dashboard
                </a>

                {/* User pill */}
                <div className="flex items-center gap-1.5 bg-blue-800/50 px-2 py-1 rounded-full max-w-[160px] sm:max-w-none">
                  <UserIcon size={16} className="shrink-0" />
                  <span className="font-medium text-sm truncate max-w-[70px] sm:max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-xs bg-white text-blue-800 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider whitespace-nowrap">
                    {user.role}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1 hover:text-red-300 transition-colors text-sm"
                >
                  <LogOut size={17} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="hover:text-blue-200 font-medium transition-colors text-sm">Login</a>
                <a
                  href="/register"
                  className="bg-white text-blue-600 px-3 py-1.5 rounded-md font-bold hover:bg-blue-50 transition-colors shadow-sm text-sm"
                >
                  Register
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-8 py-4 md:py-8 flex-1 overflow-x-hidden">
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
        <Route path="/municipal/*" element={<MunicipalNgoDashboard />} />
        <Route path="/ngo/*" element={<MunicipalNgoDashboard />} />
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