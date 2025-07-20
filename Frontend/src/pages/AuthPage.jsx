import React, { useState } from 'react';
import './AuthPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isSignup ? '/api/signup' : '/api/login';
      const res = await axios.post(`${BASE_URL}${endpoint}`, { username, password });
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button type="submit">{isSignup ? 'Sign Up' : 'Log In'}</button>
        </form>

        <p className="auth-toggle" onClick={toggleMode}>
          {isSignup
            ? 'Already have an account? Log In'
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
