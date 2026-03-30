import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { ClipboardList, Clock, CheckCircle, Filter, Eye, Upload, AlertCircle, XCircle, Flame, ArrowUp, Activity, ArrowDown } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MunicipalNgoDashboard = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [detailsModal, setDetailsModal] = useState({ show: false, complaint: null });

  // Resolution Proof modal state
  const [proofModal, setProofModal] = useState({ show: false, complaintId: null });
  const [proofNote, setProofNote] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Rejection reason modal state
  const [rejectModal, setRejectModal] = useState({ show: false, complaintId: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/assignments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    if (newStatus === 'resolved') {
      setProofModal({ show: true, complaintId });
      setProofNote('');
      setProofImageBase64('');
      return;
    }
    if (newStatus === 'rejected') {
      setRejectModal({ show: true, complaintId });
      setRejectReason('');
      return;
    }
    await submitStatus(complaintId, newStatus, null, null);
  };

  const submitStatus = async (complaintId, status, resolutionProof, remarks) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/complaints/${complaintId}/status`,
        { status, resolutionProof, remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAssignments();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proofNote.trim()) { alert('Please enter a resolution note.'); return; }
    setSubmitting(true);
    await submitStatus(proofModal.complaintId, 'resolved', {
      note: proofNote,
      image: proofImageBase64 || null,
    }, null);
    setSubmitting(false);
    setProofModal({ show: false, complaintId: null });
    setDetailsModal(prev => prev.show
      ? { ...prev, complaint: { ...prev.complaint, status: 'resolved' } }
      : prev
    );
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) { alert('Please enter a rejection reason.'); return; }
    setSubmitting(true);
    await submitStatus(rejectModal.complaintId, 'rejected', null, rejectReason);
    setSubmitting(false);
    setRejectModal({ show: false, complaintId: null });
    setDetailsModal(prev => prev.show
      ? { ...prev, complaint: { ...prev.complaint, status: 'rejected' } }
      : prev
    );
  };

  const handleProofImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProofImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':    return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':     return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':    return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected':    return 'bg-red-100 text-red-800 border-red-200';
      default:            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high':     return 'bg-orange-100 text-orange-700';
      case 'medium':   return 'bg-yellow-100 text-yellow-700';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };

  const complaints = assignments.map(a => ({ ...a.complaint, assignmentId: a._id }));
  
  let filtered = complaints;
  if (statusFilter !== 'all') {
    filtered = filtered.filter(c => c.status === statusFilter);
  }
  if (urgencyFilter !== 'all') {
    filtered = filtered.filter(c => c.urgency === urgencyFilter);
  }

  const stats = [
    { icon: <ClipboardList size={22} className="text-blue-500" />,   label: 'Total',       value: complaints.length,                                          bg: 'bg-blue-50',    filter: 'all' },
    { icon: <AlertCircle size={22} className="text-yellow-500" />,   label: 'Pending',     value: complaints.filter(c => c.status === 'pending').length,      bg: 'bg-yellow-50',  filter: 'pending' },
    { icon: <Clock size={22} className="text-indigo-500" />,          label: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length, bg: 'bg-indigo-50',  filter: 'in-progress' },
    { icon: <CheckCircle size={22} className="text-green-500" />,     label: 'Resolved',    value: complaints.filter(c => c.status === 'resolved').length,    bg: 'bg-green-50',   filter: 'resolved' },
    { icon: <XCircle size={22} className="text-red-500" />,           label: 'Rejected',    value: complaints.filter(c => c.status === 'rejected').length,    bg: 'bg-red-50',     filter: 'rejected' },
  ];

  const roleLabel = user?.role === 'ngo' ? 'NGO' : 'Municipal';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800">{roleLabel} Dashboard</h2>
        <p className="text-gray-500 mt-1">Manage your assigned complaints and update their status.</p>
      </div>

      {/* Stats — clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <button
            key={i}
            onClick={() => { setStatusFilter(stat.filter); setUrgencyFilter('all'); }}
            className={`p-4 rounded-xl border shadow-sm flex flex-col items-start space-y-2 bg-white w-full text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
              statusFilter === stat.filter && urgencyFilter === 'all' ? 'ring-2 ring-indigo-400 border-indigo-300' : 'border-gray-100'
            }`}
          >
            <div className={`p-2 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
              <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </button>
        ))}
      </div>

      {/* Urgency Stats */}
      <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Urgency Overview</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {[
          { icon: <Flame className="text-red-500" size={20} />,    label: 'Critical', value: complaints.filter(c => c.urgency === 'critical').length, bg: 'bg-red-50', filterType: 'critical' },
          { icon: <ArrowUp className="text-orange-500" size={20} />, label: 'High',     value: complaints.filter(c => c.urgency === 'high').length,     bg: 'bg-orange-50', filterType: 'high' },
          { icon: <Activity className="text-yellow-500" size={20} />,   label: 'Medium',   value: complaints.filter(c => c.urgency === 'medium').length,   bg: 'bg-yellow-50', filterType: 'medium' },
          { icon: <ArrowDown className="text-green-500" size={20} />,  label: 'Low',      value: complaints.filter(c => c.urgency === 'low').length,      bg: 'bg-green-50', filterType: 'low' },
        ].map((stat, i) => (
          <button
            key={`urgency-${i}`}
            onClick={() => { setUrgencyFilter(stat.filterType); setStatusFilter('all'); }}
            className={`p-4 rounded-xl border shadow-sm flex flex-col items-start space-y-2 bg-white w-full text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
              urgencyFilter === stat.filterType && statusFilter === 'all' ? 'ring-2 ring-red-400 border-red-300' : 'border-gray-100'
            }`}
          >
            <div className={`p-2 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
              <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">My Assigned Complaints</h2>
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In-Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block"></div>
            <select 
              value={urgencyFilter} 
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium hidden sm:block"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Title</th>
                <th className="p-4 font-semibold border-b">Citizen</th>
                <th className="p-4 font-semibold border-b">Location</th>
                <th className="p-4 font-semibold border-b">Urgency</th>
                <th className="p-4 font-semibold border-b">Update Status</th>
                <th className="p-4 font-semibold border-b text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">No assigned complaints found.</td>
                </tr>
              ) : (
                filtered.map(complaint => (
                  <tr key={complaint._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-sm mb-1">{complaint.title}</div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(complaint.status)}`}>
                        {complaint.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800 text-sm">{complaint.citizen?.name}</div>
                      <div className="text-xs text-gray-500">{complaint.citizen?.email}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {complaint.locationDetails?.area}, {complaint.locationDetails?.ward}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${getUrgencyColor(complaint.urgency)}`}>
                        {complaint.urgency?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      {(complaint.status === 'resolved' || complaint.status === 'rejected') ? (
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(complaint.status)}`}>
                          {complaint.status === 'resolved' ? '✓ Resolved' : '✗ Rejected'}
                        </span>
                      ) : (
                        <select
                          value={complaint.status}
                          onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(complaint.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In-Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setDetailsModal({ show: true, complaint })}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Resolution Proof Modal ── */}
      {proofModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Submit Resolution Proof</h3>
                <p className="text-sm text-gray-500 mt-0.5">Provide evidence that the issue has been resolved.</p>
              </div>
              <button onClick={() => setProofModal({ show: false, complaintId: null })} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleProofSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resolution Note <span className="text-red-500">*</span></label>
                <textarea
                  rows="4"
                  required
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Describe how the issue was resolved..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Upload size={14} className="inline mr-1" />
                  Attach Proof Image <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/tif,image/avif,image/heic,image/heif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                  onChange={handleProofImage}
                  className="w-full px-4 py-3 border rounded-lg bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {proofImageBase64 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img src={proofImageBase64} alt="Proof preview" className="max-h-36 rounded-lg border object-contain" />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t">
                <button type="button" onClick={() => setProofModal({ show: false, complaintId: null })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-medium disabled:opacity-60">
                  {submitting ? 'Submitting...' : '✓ Mark as Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
      {detailsModal.show && detailsModal.complaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-800">Complaint Details</h3>
              <button onClick={() => setDetailsModal({ show: false, complaint: null })} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-bold text-gray-800">{detailsModal.complaint.title}</h4>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(detailsModal.complaint.status)}`}>
                  {detailsModal.complaint.status?.toUpperCase()}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 space-y-2">
                <p><strong>Citizen:</strong> {detailsModal.complaint.citizen?.name} ({detailsModal.complaint.citizen?.email})</p>
                <p><strong>Location:</strong> {detailsModal.complaint.locationDetails?.area}, {detailsModal.complaint.locationDetails?.ward}</p>
                <p><strong>Category:</strong> {detailsModal.complaint.category?.name || 'N/A'}</p>
                <p><strong>Urgency:</strong> <span className={`px-2 py-0.5 rounded text-xs font-bold ${getUrgencyColor(detailsModal.complaint.urgency)}`}>{detailsModal.complaint.urgency?.toUpperCase()}</span></p>
                <p><strong>Submitted:</strong> {new Date(detailsModal.complaint.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Description</h5>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">{detailsModal.complaint.description}</p>
              </div>

              {detailsModal.complaint.images?.[0] && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Complaint Picture</h5>
                  <img src={detailsModal.complaint.images[0]} alt="Complaint" className="max-h-64 rounded-lg border object-contain" />
                </div>
              )}

              {/* Quick Status Update */}
              {(detailsModal.complaint.status !== 'resolved' && detailsModal.complaint.status !== 'rejected') && (
                <div className="border-t pt-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Update Status</h5>
                  <select
                    value={detailsModal.complaint.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      if (newStatus === 'resolved') {
                        setDetailsModal({ show: false, complaint: null });
                        setProofModal({ show: true, complaintId: detailsModal.complaint._id });
                        setProofNote('');
                        setProofImageBase64('');
                      } else if (newStatus === 'rejected') {
                        setDetailsModal({ show: false, complaint: null });
                        setRejectModal({ show: true, complaintId: detailsModal.complaint._id });
                        setRejectReason('');
                      } else {
                        handleStatusChange(detailsModal.complaint._id, newStatus);
                        setDetailsModal(prev => ({ ...prev, complaint: { ...prev.complaint, status: newStatus } }));
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
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

      {/* ── Rejection Reason Modal ── */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Reason for Rejection</h3>
                <p className="text-sm text-gray-500 mt-0.5">Explain why this complaint is being rejected.</p>
              </div>
              <button onClick={() => setRejectModal({ show: false, complaintId: null })} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                <textarea
                  rows="4"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-400 text-sm"
                  placeholder="e.g. Outside jurisdiction, duplicate issue, insufficient information..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t">
                <button type="button" onClick={() => setRejectModal({ show: false, complaintId: null })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md font-medium disabled:opacity-60">
                  {submitting ? 'Submitting...' : '✗ Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MunicipalNgoDashboard;
