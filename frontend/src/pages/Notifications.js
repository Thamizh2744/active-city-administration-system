import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Check } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
          <Bell size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-500">Stay updated on your complaints and assignments.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notif => (
              <div key={notif._id} className={`p-6 flex items-start justify-between transition-colors ${notif.isRead ? 'bg-white' : 'bg-indigo-50/50'}`}>
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 p-2 rounded-full ${notif.isRead ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className={`text-base ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!notif.isRead && (
                  <button 
                    onClick={() => markAsRead(notif._id)}
                    className="flex items-center space-x-1 text-sm bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium transition-colors"
                  >
                    <Check size={16} />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
