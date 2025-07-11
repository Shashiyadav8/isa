import { useEffect, useState, useCallback } from 'react';
import axios from './axiosInstance';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import LeaveManagementSection from './LeaveManagementSection';
import TaskOverviewSection from './TaskOverviewSection';
import AnalyticsSection from './AnalyticsSection';
import EmployeeProfileViewer from './EmployeeProfileViewer';
import AdminSettingsSection from './AdminSettingsSection';
import AdminCorrectionPanel from './AdminCorrectionPanel';

const AdminDashboard = () => {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    employee_id: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    role: 'employee'
  });
  const [showEmployees, setShowEmployees] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchRecords = useCallback(async () => {
    try {
      const res = await axios.get('/attendance/attendance-records');
      setRecords(res.data);
      setFiltered(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch attendance records.');
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await axios.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch employees.');
    }
  }, []);

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchRecords();
  }, [token, navigate, fetchRecords]);

  useEffect(() => {
    let result = records;
    if (search) {
      result = result.filter((record) =>
        record.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
        record.employee_id?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedDate) {
      result = result.filter((record) => record.date === selectedDate);
    }
    setFiltered(result);
  }, [search, selectedDate, records]);

  const handleExportCSV = () => {
    const csvRows = [
      ['Emp ID', 'Name', 'IP', 'Date', 'Punch In', 'Punch Out'],
      ...filtered.map((r) => [
        r.employee_id,
        r.employee_name,
        r.ip,
        r.date,
        r.punch_in_time ? new Date(r.punch_in_time).toLocaleTimeString() : '',
        r.punch_out_time ? new Date(r.punch_out_time).toLocaleTimeString() : ''
      ])
    ];
    const blob = new Blob([csvRows.map((e) => e.join(',')).join('\n')], {
      type: 'text/csv'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'attendance_records.csv';
    a.click();
  };

  const handleAddEmployee = async () => {
    const { name, employee_id, email, password } = newEmployee;
    if (!name || !employee_id || !email || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      await axios.post('/employees', newEmployee);
      setNewEmployee({
        name: '',
        employee_id: '',
        email: '',
        password: '',
        phone: '',
        position: '',
        role: 'employee'
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError('Failed to add employee.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError('Failed to delete employee.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleEmployees = () => {
    if (!showEmployees) fetchEmployees();
    setShowEmployees(!showEmployees);
  };

  const updateLeaveQuota = async (id, quota) => {
    try {
      await axios.put(`/employees/${id}/leave-quota`, { leave_quota: quota });
      alert('Leave quota updated');
    } catch (err) {
      console.error('Failed to update leave quota:', err);
      alert('Failed to update leave quota');
    }
  };

  const handleViewPhoto = async (id) => {
    try {
      const res = await axios.get(`/attendance/photo/${id}`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error opening photo:', err);
      alert('Unable to view photo');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Attendance Records</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search by name or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        <button onClick={handleExportCSV}>Export CSV</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <h3>Employees</h3>
      <button onClick={toggleEmployees} className="toggle-btn">
        {showEmployees ? 'Hide Employees' : 'Show Employees'}
      </button>

      {showEmployees && (
        <>
          <div className="employee-form">
            <input placeholder="Name" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} />
            <input placeholder="Employee ID" value={newEmployee.employee_id} onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })} />
            <input placeholder="Email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
            <input placeholder="Phone" value={newEmployee.phone} onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} />
            <input placeholder="Password" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} />
            <input placeholder="Position" value={newEmployee.position} onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })} />
            <select value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAddEmployee}>Add Employee</button>
          </div>

          <ul className="employee-list">
            {employees.map(emp => (
              <li key={emp._id}>
                <strong>{emp.name}</strong> ({emp.email})<br />
                Position: {emp.position || 'N/A'} | Role: {emp.role || 'N/A'}<br />
                Leave Quota:
                <input
                  type="number"
                  value={emp.leave_quota || 0}
                  onChange={(e) => {
                    const updatedQuota = parseInt(e.target.value, 10);
                    setEmployees(prev =>
                      prev.map(u =>
                        u._id === emp._id ? { ...u, leave_quota: updatedQuota } : u
                      )
                    );
                  }}
                  style={{ width: '60px', margin: '0 10px' }}
                />
                <button onClick={() => updateLeaveQuota(emp._id, emp.leave_quota)}>Save</button>
                <button onClick={() => handleDeleteEmployee(emp._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>Attendance</h3>
      {filtered.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="responsive-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name (Emp ID)</th>
                <th>IP</th>
                <th>Date</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Selfie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id}>
                  <td data-label="Name">
                    {record.employee_name} <br />
                    <small>{record.employee_id}</small>
                  </td>
                  <td data-label="IP">{record.ip}</td>
                  <td data-label="Date">{record.date}</td>
                  <td data-label="Punch In">{record.punch_in_time ? new Date(record.punch_in_time).toLocaleTimeString() : '-'}</td>
                  <td data-label="Punch Out">{record.punch_out_time ? new Date(record.punch_out_time).toLocaleTimeString() : '-'}</td>
                  <td data-label="Selfie">
                    {record.photo_path ? (
                      <button onClick={() => handleViewPhoto(record.id)}>View</button>
                    ) : (
                      'No Image'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EmployeeProfileViewer />
      <AdminSettingsSection />
      <AdminCorrectionPanel token={token} />
      <LeaveManagementSection />
      <TaskOverviewSection />
      <AnalyticsSection />
    </div>
  );
};

export default AdminDashboard;
