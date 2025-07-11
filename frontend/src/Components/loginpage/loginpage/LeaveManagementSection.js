// components/admin/LeaveManagementSection.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from './axiosInstance';
import './LeaveManagementSection.css';

function LeaveManagementSection() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await axios.get('/leaves/admin'); // ✅ updated
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/leaves/${id}/approve`); // ✅ updated
      fetchLeaves();
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/leaves/${id}/reject`); // ✅ updated
      fetchLeaves();
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    return (
      (!filter || leave.name.toLowerCase().includes(filter.toLowerCase())) &&
      (!statusFilter || leave.status.toLowerCase() === statusFilter.toLowerCase())
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="leave-management-section">
      <h3>📋 Leave Management</h3>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {filteredLeaves.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <div className="responsive-leave-table">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td data-label="Employee">{leave.name}</td>
                  <td data-label="From">{formatDate(leave.start_date)}</td>
                  <td data-label="To">{formatDate(leave.end_date)}</td>
                  <td data-label="Reason">{leave.reason}</td>
                  <td data-label="Status">{leave.status}</td>
                  <td data-label="Action">
                    {leave.status.toLowerCase() === 'pending' ? (
                      <>
                        <button className="approve" onClick={() => handleApprove(leave.id)}>Approve</button>
                        <button className="reject" onClick={() => handleReject(leave.id)}>Reject</button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeaveManagementSection;
