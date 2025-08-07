import React from 'react';
import RegisterForm from '../components/RegisterForm';
import './pagestyles/RegisterPage.css'; // Make sure this path matches your folder structure

const RegisterPage = () => {
  return (
    <div className="register-page-container">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
