import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: '', role: 'citizen', countryCode: '+91'
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Combine country code and phone if phone is provided
    const submitData = { ...formData };
    if (formData.phone) {
      if (!/^\d{10}$/.test(formData.phone)) {
        setError('Phone number must be exactly 10 digits');
        return;
      }
      submitData.phone = `${formData.countryCode} ${formData.phone}`;
    }
    delete submitData.countryCode;

    const success = await register(submitData);
    if (!success) {
      setError('Registration failed. Email might be already in use.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <UserPlus size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
              <input type="text" name="name" required onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
              <input type="email" name="email" required onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input type="password" name="password" required onChange={handleChange} minLength={6}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
              <select name="role" onChange={handleChange} value={formData.role}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="citizen">Citizen</option>
                <option value="administrator">Administrator</option>
                <option value="municipal">Municipal Worker</option>
                <option value="ngo">NGO Representative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
            <div className="flex">
              <select name="countryCode" onChange={handleChange} value={formData.countryCode}
                className="px-2 py-2 border border-r-0 rounded-l-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-fit">
                <option value="+91">🇮🇳 +91</option>
              </select>
              <input type="tel" name="phone" onChange={handleChange} required pattern="\d{10}" title="Phone number must be exactly 10 digits" maxLength="10"
                className="w-full px-4 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
            <textarea name="address" onChange={handleChange} rows="2"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full address"></textarea>
          </div>

          <button type="submit" 
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;