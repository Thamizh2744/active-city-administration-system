import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Search, AlertCircle, Clock, CheckCircle, ShieldCheck } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CitizenDashboard = () => {

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedComplaintForFeedback, setSelectedComplaintForFeedback] = useState(null);
  const [resolutionModal, setResolutionModal] = useState({ show: false, complaint: null });
  
  // Feedback form state
  const [feedbackData, setFeedbackData] = useState({
    rating: 5, comments: ''
  });

  // New complaint form state
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', area: '', ward: '', urgency: 'medium', imageBase64: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [compRes, catRes, locRes] = await Promise.all([
        axios.get(`${API_URL}/complaints/my`, config),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/locations`)
      ]);
      
      setComplaints(compRes.data);
      setCategories(catRes.data);
      setLocations(locRes.data);
      if(catRes.data.length > 0) setFormData(prev => ({...prev, category: catRes.data[0]._id}));
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageBase64: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, imageBase64: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageBase64) {
      alert("Please attach a picture before submitting.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/complaints`, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        urgency: formData.urgency,
        locationDetails: {
          area: formData.area,
          ward: formData.ward
        },
        images: formData.imageBase64 ? [formData.imageBase64] : []
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowModal(false);
      setFormData({ title: '', description: '', category: categories[0]?._id, area: '', ward: '', urgency: 'medium', imageBase64: '' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to submit complaint", error);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/feedback`, {
        complaintId: selectedComplaintForFeedback._id,
        rating: feedbackData.rating,
        comments: feedbackData.comments
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowFeedbackModal(false);
      setFeedbackData({ rating: 5, comments: '' });
      setSelectedComplaintForFeedback(null);
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error("Failed to submit feedback", error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved': return <CheckCircle className="text-green-500" />;
      case 'in-progress': return <Clock className="text-blue-500" />;
      case 'pending': return <AlertCircle className="text-yellow-500" />;
      default: return <AlertCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Complaints</h2>
          <p className="text-gray-500 mt-1">Track and manage your submitted civic issues.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-md transition-all transform hover:scale-105"
        >
          <PlusCircle size={20} />
          <span>New Complaint</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
            <div className="mx-auto w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No complaints found</h3>
            <p className="text-gray-500 mt-2">You haven't submitted any complaints yet. Click "New Complaint" to report an issue.</p>
          </div>
        ) : (
          complaints.map(complaint => (
            <div key={complaint._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{complaint.title}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
                    {complaint.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">Category: {complaint.category?.name || 'Unknown'}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Area: {complaint.locationDetails?.area}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Urgency: {complaint.urgency}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-500 flex justify-between items-center">
                <span>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center space-x-3">
                  {complaint.status === 'resolved' && (
                    <>
                      {complaint.resolutionProof?.note && (
                        <button
                          onClick={() => setResolutionModal({ show: true, complaint })}
                          className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                        >
                          <ShieldCheck size={12} /> View Resolution
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedComplaintForFeedback(complaint);
                          setShowFeedbackModal(true);
                        }}
                        className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium hover:bg-indigo-200 transition-colors"
                      >
                        Provide Feedback
                      </button>
                    </>
                  )}
                  {getStatusIcon(complaint.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-800">Submit New Complaint</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Broken Streetlight on Main St" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea name="description" required value={formData.description} onChange={handleInputChange} rows="4"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Provide detailed information about the issue..."></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select name="category" required value={formData.category} onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
                  <select name="urgency" value={formData.urgency} onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location / Area</label>
                  <input type="text" name="area" required value={formData.area} onChange={handleInputChange} list="locations"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Downtown" />
                  <datalist id="locations">
                    {locations.map(l => <option key={l._id} value={l.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ward / Sector</label>
                  <input type="text" name="ward" required value={formData.ward} onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Ward 4" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Picture (Required)</label>
                <input type="file" accept="image/*" required onChange={handleImageChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                <p className="text-xs text-gray-500 mt-2">Upload a clear photo to help authorities identify the issue faster.</p>
                {formData.imageBase64 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Image Preview:</p>
                    <img src={formData.imageBase64} alt="Preview" className="max-h-48 rounded-lg border shadow-sm" />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-colors">
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedComplaintForFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Provide Feedback</h3>
              <button 
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedComplaintForFeedback(null);
                }} 
                className="text-gray-400 hover:text-gray-600 text-3xl font-light"
              >&times;</button>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                How satisfied are you with the resolution of: <br/>
                <strong>{selectedComplaintForFeedback.title}</strong>?
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (1-5)</label>
                <select 
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={feedbackData.rating}
                  onChange={(e) => setFeedbackData({...feedbackData, rating: Number(e.target.value)})}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comments</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional comments (optional)..."
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData({...feedbackData, comments: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" 
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    

      {/* Resolution Proof Modal */}
      {resolutionModal.show && resolutionModal.complaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <ShieldCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Resolution Proof</h3>
                  <p className="text-xs text-gray-500">{resolutionModal.complaint.title}</p>
                </div>
              </div>
              <button onClick={() => setResolutionModal({ show: false, complaint: null })} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">✓ Your complaint has been resolved</p>
                {resolutionModal.complaint.resolutionProof?.resolvedBy && (
                  <p className="text-xs text-green-700">
                    Resolved by: <strong>{resolutionModal.complaint.resolutionProof.resolvedBy}</strong>
                    {resolutionModal.complaint.resolutionProof?.resolvedAt &&
                      ` on ${new Date(resolutionModal.complaint.resolutionProof.resolvedAt).toLocaleDateString()}`
                    }
                  </p>
                )}
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Resolution Note</h5>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap text-sm">
                  {resolutionModal.complaint.resolutionProof?.note}
                </p>
              </div>

              {resolutionModal.complaint.resolutionProof?.image && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Proof Image</h5>
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img
                      src={resolutionModal.complaint.resolutionProof.image}
                      alt="Resolution proof"
                      className="max-w-full max-h-72 rounded object-contain mx-auto block"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setResolutionModal({ show: false, complaint: null })}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
