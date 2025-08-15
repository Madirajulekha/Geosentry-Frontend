import React from 'react';
import LoginForm from '../components/LoginForm';
import './pagestyles/LoginPage.css'; // Import the custom CSS

const LoginPage = () => {
  return (
    <div className="login-page-container">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
