import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css'; // Import custom CSS

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="navbar-logo">Geosentry</Link>
      </div>

      <div className="navbar-right">
        <Link to="/items" className="navbar-link">Items</Link>
        <Link to="/cart" className="navbar-link">Cart</Link>

        <div className="navbar-dropdown" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="navbar-link dropdown-toggle"
          >
            Profile
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                My Profile
              </Link>
              <Link
                to="/update-password"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Change Password
              </Link>
              <button
                onClick={logout}
                className="dropdown-item logout-button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
