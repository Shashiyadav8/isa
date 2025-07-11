// src/Components/ChangePasswordSection.js
import React, { useState } from 'react';
import axios from './axiosInstance';
import './ChangePasswordSection.css';

const ChangePasswordSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleForm = () => setShowForm(!showForm);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/auth/request-otp', { email });
      setStep(2);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const res = await axios.post('/auth/verify-otp-change-password', {
        email,
        otp,
        newPassword,
      });

      setMessage(res.data.message);
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="change-password-container">
      <button className="toggle-button" onClick={toggleForm}>
        {showForm ? 'Close Password Form' : 'Change Password'}
      </button>

      <div className={`form-wrapper ${showForm ? 'open' : ''}`}>
        <h3>Change Password (via OTP)</h3>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <label>OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">Verify & Change</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordSection;
