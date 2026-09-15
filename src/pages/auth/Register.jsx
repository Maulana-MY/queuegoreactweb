import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/api/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="py-8 px-4 sm:px-10 shadow-lg border-none ring-1 ring-gray-900/5">
      <form className="space-y-6" onSubmit={handleRegister}>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <TextInput
          label="Full Name"
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
        />
        
        <TextInput
          label="Email Address"
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />

        <TextInput
          label="Password"
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
        />

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User (Customer)</option>
            <option value="operator">Operator (Staff)</option>
          </select>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Sign in
        </Link>
      </div>
    </Card>
  );
};

export default Register;
