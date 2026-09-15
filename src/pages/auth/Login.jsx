import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/login', { email, password });
      const userData = response.data.data;
      localStorage.setItem('token', response.data.token || 'user_token');
      localStorage.setItem('user', JSON.stringify(userData));
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="py-8 px-4 sm:px-10 shadow-lg border-none ring-1 ring-gray-900/5">
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <TextInput
          label="Email Address"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <TextInput
          label="Password"
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Register here
        </Link>
      </div>
    </Card>
  );
};

export default Login;
