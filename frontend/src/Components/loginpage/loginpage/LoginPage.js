import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from 'axios';

function LoginPage() {
  const [tab, setTab] = useState('employee');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        employee_id: employeeId,
        password,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        setError('Invalid credentials or missing token.');
        return;
      }

      // ✅ Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // ✅ Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/employee-dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check credentials or backend connection.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ISAR </h1>
        <h2>Employee Management Login</h2>

        <div className="tab-buttons">
          <button
            className={tab === 'employee' ? 'active' : ''}
            onClick={() => setTab('employee')}
          >
            Employee
          </button>
          <button
            className={tab === 'admin' ? 'active' : ''}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
        </div>

        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
