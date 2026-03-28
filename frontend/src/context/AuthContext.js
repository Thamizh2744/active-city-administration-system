import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const getDashboardPath = (role) => {
    switch (role) {
      case 'citizen':       return '/citizen';
      case 'administrator': return '/admin';
      case 'municipal':     return '/municipal';
      case 'ngo':           return '/ngo';
      default:              return '/login';
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user || res.data);

      // Navigate based on role
      const role = res.data.role || res.data.user?.role;
      navigate(getDashboardPath(role));

      return true;
    } catch (error) {
      console.error("Login failed", error.response?.data);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      navigate(getDashboardPath(res.data.role));
      return { success: true };
    } catch (error) {
      console.error("Register failed", error);
      return { success: false, message: error.response?.data?.message || 'Network error or server is unavailable' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
