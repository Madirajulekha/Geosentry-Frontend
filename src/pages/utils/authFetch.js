// src/utils/authFetch.js

let hasAlerted = false;

const handleUnauthorized = () => {
  if (!hasAlerted) {
    hasAlerted = true;
    alert('Session expired. Please login again.');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
};

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');

  const res = await fetch("http://localhost:5000" + url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    console.warn('⚠️ Unauthorized (401) - Token expired or invalid');
    handleUnauthorized();
    return;
  }

  if (!res.ok) {
    const { message = '' } = await res.json();

    if (message.toLowerCase() === 'invalid token') {
      handleUnauthorized();
      return;
    }

    console.error('🔴 Unexpected response:', message);
    throw new Error(`Unexpected server response: ${res.status}`);
  }

  return res.json();
};
