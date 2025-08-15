import React, { useEffect, useState } from 'react';
import './pagestyles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('https://us-central1-focal-inquiry-468015-q5.cloudfunctions.net/api/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setFormData({ username: data.username, email: data.email });
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, [token]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('https://us-central1-focal-inquiry-468015-q5.cloudfunctions.net/api/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        // Accept both {user: {...}} and {...}
        setUser(data.user || data);
        setMessage('Profile updated successfully!');
        setEditMode(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Server error');
    }
  };

  if (!user) return <p className="loading-message">Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Your Details</h2>

      {message && <p className="success-message">{message}</p>}

      <div className="profile-details">
        <div className="form-group">
          <label className="form-label">Username</label>
          {editMode ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
            />
          ) : (
            <p>{user.username}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <p>{user.role}</p>
        </div>

        {editMode ? (
          <div className="button-group">
            <button
              onClick={handleSave}
              className="save-button"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setFormData({ username: user.username, email: user.email });
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="edit-button"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;