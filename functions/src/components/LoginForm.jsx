import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import './styles/LoginForm.css'; // Make sure this file is in the same folder

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://us-central1-focal-inquiry-468015-q5.cloudfunctions.net/api/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('authToken', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Panel */}
        <div className="login-left">
  <h2>WELCOME</h2>
  <p className="headline">Geosentry</p>
  <p className="description">
    Geosentry is your centralized platform for secure data access, user management, and real-time monitoring. Log in to manage your resources, view analytics, and streamline operations with confidence.
  </p>
</div>


        {/* Right Panel */}
        <form className="login-right" onSubmit={handleLogin}>
          <div className="form-header">
            <h3>Sign in</h3>
            
          </div>

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="User Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="btn-primary">
            Sign in
          </button>


          <p className="register-text">
            Don’t have an account? <a href="/register">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
