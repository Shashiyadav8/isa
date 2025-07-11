import React, { useEffect, useState } from 'react';
import axios from './axiosInstance';
import './AdminSettingsSection.css';

const AdminSettingsSection = () => {
  const [allowedIps, setAllowedIps] = useState('');
  const [allowedDevices, setAllowedDevices] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/admin/settings');

        setAllowedIps(
          Array.isArray(res.data.allowed_ips)
            ? res.data.allowed_ips.join(',')
            : res.data.allowed_ips || ''
        );

        setAllowedDevices(
          Array.isArray(res.data.allowed_devices)
            ? res.data.allowed_devices.join(',')
            : res.data.allowed_devices || ''
        );

        setStartTime(res.data.working_hours_start || '');
        setEndTime(res.data.working_hours_end || '');
      } catch (err) {
        console.error('Error fetching admin settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedIps = allowedIps
        .split(',')
        .map(ip => ip.trim())
        .filter(Boolean);

      const formattedDevices = allowedDevices
        .split(',')
        .map(ip => ip.trim())
        .filter(Boolean);

      await axios.put('/admin/settings', {
        allowed_ips: formattedIps,
        allowed_devices: formattedDevices,
        working_start: startTime,
        working_end: endTime
      });

      alert('✅ Settings updated successfully');
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('❌ Failed to update settings');
    }
  };

  return (
    <div className="admin-settings-section">
      <h3>⚙️ Admin Settings</h3>
      <form onSubmit={handleSubmit} className="settings-form">
        <label>Allowed WiFi IPs (comma-separated):</label>
        <input
          type="text"
          value={allowedIps}
          onChange={(e) => setAllowedIps(e.target.value)}
          placeholder="e.g. 192.168.1.1,192.168.0.105"
        />

        <label>Allowed Device IPs (comma-separated):</label>
        <input
          type="text"
          value={allowedDevices}
          onChange={(e) => setAllowedDevices(e.target.value)}
          placeholder="e.g. 192.168.1.100,127.0.0.1"
        />

        <label>Working Start Time:</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>Working End Time:</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <button type="submit">Update Settings</button>
      </form>
    </div>
  );
};

export default AdminSettingsSection;
