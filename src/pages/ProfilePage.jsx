import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
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
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
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

  if (!user) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow rounded mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Details</h2>

      {message && <p className="text-green-600 mb-3">{message}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Username</label>
          {editMode ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          ) : (
            <p>{user.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Role</label>
          <p>{user.role}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Joined On</label>
          <p>{new Date(user.created_at).toLocaleString()}</p>
        </div>

        {editMode ? (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setFormData({ username: user.username, email: user.email });
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
