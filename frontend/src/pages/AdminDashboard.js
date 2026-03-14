import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Settings, Users, ClipboardList, Filter, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [filterStr, setFilterStr] = useState('all');
  const [authorities, setAuthorities] = useState([]);
  const [assignModal, setAssignModal] = useState({ show: false, complaintId: null, selectedUser: '' });

  useEffect(() => {
    fetchComplaints();
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/auth/authorities`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuthorities(res.data);
    } catch(err) {
      console.error("Failed to fetch authorities", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      // If user is administrator, fetch all. If municipal/ngo, fetch assigned.
      let endpoint = `${API_URL}/complaints`;
      if (user?.role === 'municipal' || user?.role === 'ngo') {
        endpoint = `${API_URL}/assignments/my`;
      }
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // If assigned route, it returns assignment objects containing the complaint. 
      // We need to map them to matching interface.
      if (user?.role === 'municipal' || user?.role === 'ngo') {
        setComplaints(res.data.map(a => ({ ...a.complaint, assignmentId: a._id, assignmentStatus: a.status })));
      } else {
        setComplaints(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch complaints", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/complaints/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints(); // Refresh
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Assignment route
      await axios.post(`${API_URL}/assignments`, {
        complaintId: assignModal.complaintId,
        assignedToId: assignModal.selectedUser,
        notes: "Assigned by admin"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignModal({ show: false, complaintId: null, selectedUser: '' });
      fetchComplaints(); // Refresh to show "assigned" status
    } catch (error) {
      console.error("Failed to assign", error);
      alert("Assignment failed. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredComplaints = filterStr === 'all' ? complaints : complaints.filter(c => c.status === filterStr);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: <ClipboardList className="text-blue-500" size={24} />, label: 'Total Complaints', value: complaints.length, bg: 'bg-blue-50' },
          { icon: <AlertCircle className="text-yellow-500" size={24} />, label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, bg: 'bg-yellow-50' },
          { icon: <Settings className="text-purple-500" size={24} />, label: 'Assigned', value: complaints.filter(c => c.status === 'assigned').length, bg: 'bg-purple-50' },
          { icon: <CheckCircle className="text-green-500" size={24} />, label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4 bg-white`}>
            <div className={`p-4 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.role === 'administrator' ? 'Operational Dashboard' : 'My Assignments'}
          </h2>
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={filterStr} 
              onChange={(e) => setFilterStr(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In-Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">ID / Title</th>
                <th className="p-4 font-semibold border-b">Citizen</th>
                <th className="p-4 font-semibold border-b">Location</th>
                <th className="p-4 font-semibold border-b">Urgency</th>
                <th className="p-4 font-semibold border-b">Status</th>
                <th className="p-4 font-semibold border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">No complaints found.</td>
                </tr>
              ) : (
                filteredComplaints.map(complaint => (
                  <tr key={complaint._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-sm mb-1">{complaint.title}</div>
                      <div className="text-xs text-gray-400 font-mono">{complaint._id.substring(0,8)}...</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800 text-sm">{complaint.citizen?.name}</div>
                      <div className="text-xs text-gray-500">{complaint.citizen?.email}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {complaint.locationDetails?.area}, {complaint.locationDetails?.ward}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md 
                        ${complaint.urgency === 'critical' ? 'bg-red-100 text-red-700' : 
                          complaint.urgency === 'high' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {complaint.urgency.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={complaint.status} 
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(complaint.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      {user?.role === 'administrator' && complaint.status === 'pending' ? (
                        <button 
                          onClick={() => setAssignModal({ show: true, complaintId: complaint._id, selectedUser: authorities[0]?._id })}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold hover:underline bg-indigo-50 px-3 py-1 rounded"
                        >
                          Assign
                        </button>
                      ) : (
                        <button className="text-gray-500 hover:text-gray-700 text-sm font-semibold hover:underline bg-gray-50 px-3 py-1 rounded">
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assignModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Assign Authority</h3>
              <button onClick={() => setAssignModal({ show: false, complaintId: null, selectedUser: '' })} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Authority/Department</label>
                <select 
                  value={assignModal.selectedUser}
                  onChange={(e) => setAssignModal({...assignModal, selectedUser: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {authorities.map(auth => (
                    <option key={auth._id} value={auth._id}>{auth.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setAssignModal({ show: false, complaintId: null, selectedUser: '' })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
