import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Settings, ClipboardList, Filter, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [filterStr, setFilterStr] = useState('all');
  const [authorities, setAuthorities] = useState([]);
  const [assignModal, setAssignModal] = useState({ show: false, complaintId: null, selectedUser: '' });
  const [detailsModal, setDetailsModal] = useState({ show: false, complaint: null });

  useEffect(() => {
    fetchComplaints();
    fetchAuthorities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const res = await axios.get(`${API_URL}/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (error) {
      console.error("Failed to fetch complaints", error);
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        {[
          { icon: <ClipboardList className="text-blue-500" size={20} />,    label: 'Total',       value: complaints.length,                                          bg: 'bg-blue-50',   filter: 'all' },
          { icon: <AlertCircle className="text-yellow-500" size={20} />,    label: 'Pending',     value: complaints.filter(c => c.status === 'pending').length,      bg: 'bg-yellow-50', filter: 'pending' },
          { icon: <Settings className="text-purple-500" size={20} />,       label: 'Assigned',    value: complaints.filter(c => c.status === 'assigned').length,     bg: 'bg-purple-50', filter: 'assigned' },
          { icon: <Clock className="text-blue-400" size={20} />,            label: 'In-Progress', value: complaints.filter(c => c.status === 'in-progress').length,  bg: 'bg-sky-50',    filter: 'in-progress' },
          { icon: <CheckCircle className="text-green-500" size={20} />,     label: 'Resolved',    value: complaints.filter(c => c.status === 'resolved').length,     bg: 'bg-green-50',  filter: 'resolved' },
          { icon: <XCircle className="text-red-500" size={20} />,           label: 'Rejected',    value: complaints.filter(c => c.status === 'rejected').length,     bg: 'bg-red-50',    filter: 'rejected' },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={() => setFilterStr(stat.filter)}
            className={`p-3 sm:p-4 rounded-xl border shadow-sm flex flex-col items-start space-y-1.5 bg-white w-full text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
              filterStr === stat.filter ? 'ring-2 ring-indigo-400 border-indigo-300' : 'border-gray-100'
            }`}
          >
            <div className={`p-1.5 sm:p-2 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Dashboard header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Operational Dashboard</h2>
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border w-full sm:w-auto">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <select 
              value={filterStr} 
              onChange={(e) => setFilterStr(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium w-full"
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
        
        {/* Scrollable table on mobile */}
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch w-full">
          <table className="w-full text-left border-collapse" style={{minWidth: '580px'}}>
            <thead>
              <tr className="bg-gray-100/50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-3 sm:p-4 font-semibold border-b">ID / Title</th>
                <th className="p-3 sm:p-4 font-semibold border-b">Citizen</th>
                <th className="p-3 sm:p-4 font-semibold border-b">Location</th>
                <th className="p-3 sm:p-4 font-semibold border-b">Urgency</th>
                <th className="p-3 sm:p-4 font-semibold border-b">Status</th>
                <th className="p-3 sm:p-4 font-semibold border-b text-right">Actions</th>
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
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-gray-800 text-sm mb-0.5">{complaint.title}</div>
                      <div className="text-xs text-gray-400 font-mono">{complaint._id.substring(0,8)}...</div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-medium text-gray-800 text-sm">{complaint.citizen?.name}</div>
                      <div className="text-xs text-gray-500">{complaint.citizen?.email}</div>
                    </td>
                    <td className="p-3 sm:p-4 text-sm text-gray-600">
                      {complaint.locationDetails?.area}, {complaint.locationDetails?.ward}
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md 
                        ${complaint.urgency === 'critical' ? 'bg-red-100 text-red-700' : 
                          complaint.urgency === 'high' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {complaint.urgency.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(complaint.status)}`}>
                        {complaint.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => setAssignModal({ show: true, complaintId: complaint._id, selectedUser: authorities[0]?._id })}
                            className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors whitespace-nowrap"
                          >
                            Assign
                          </button>
                        )}
                        <button
                          onClick={() => setDetailsModal({ show: true, complaint })}
                          className="text-gray-500 hover:text-gray-700 text-xs font-semibold bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors whitespace-nowrap"
                        >
                          Details
                        </button>
                      </div>
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
      
      {/* Details Modal */}
      {detailsModal.show && detailsModal.complaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-800">Complaint Details</h3>
              <button onClick={() => setDetailsModal({ show: false, complaint: null })} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-1">{detailsModal.complaint.title}</h4>
                <p className="text-sm font-semibold text-gray-500">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(detailsModal.complaint.status)} mr-2`}>
                    {detailsModal.complaint.status.toUpperCase()}
                  </span>
                  ID: {detailsModal.complaint._id}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700">
                <p className="mb-2"><strong>Citizen:</strong> {detailsModal.complaint.citizen?.name} ({detailsModal.complaint.citizen?.email})</p>
                <p className="mb-2"><strong>Location:</strong> {detailsModal.complaint.locationDetails?.area}, {detailsModal.complaint.locationDetails?.ward}</p>
                <p className="mb-2"><strong>Urgency:</strong> {detailsModal.complaint.urgency.toUpperCase()}</p>
                <p><strong>Submitted:</strong> {new Date(detailsModal.complaint.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Description</h5>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">{detailsModal.complaint.description}</p>
              </div>

              {detailsModal.complaint.images && detailsModal.complaint.images.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Attached Picture</h5>
                  <div className="border rounded-lg p-2 bg-gray-50 inline-block">
                    <img 
                      src={detailsModal.complaint.images[0]} 
                      alt="Complaint" 
                      className="max-w-full max-h-96 rounded object-contain" 
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setDetailsModal({ show: false, complaint: null })}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
