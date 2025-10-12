import React, { useState, useEffect } from 'react';
import { getAllMembers } from '../services/api';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await getAllMembers();
      setMembers(res.data.members);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  // Calculate gender distribution
  const genderData = [
    {
      name: 'Male',
      value: members.filter(m => m.Gender === 'Male').length
    },
    {
      name: 'Female',
      value: members.filter(m => m.Gender === 'Female').length
    }
  ];

  // Calculate age distribution
  const ageData = [
    { name: 'Child (0-12)', count: members.filter(m => m.Age <= 12).length },
    { name: 'Teen (13-18)', count: members.filter(m => m.Age >= 13 && m.Age <= 18).length },
    { name: 'Adult (19-50)', count: members.filter(m => m.Age >= 19 && m.Age <= 50).length },
    { name: 'Elder (51+)', count: members.filter(m => m.Age >= 51).length }
  ];

  // Calculate UTR distribution
  const utrData = [
    { name: 'Low (0-4)', count: members.filter(m => m.UTR >= 0 && m.UTR <= 4).length },
    { name: 'Mid (5-8)', count: members.filter(m => m.UTR >= 5 && m.UTR <= 8).length },
    { name: 'High (9+)', count: members.filter(m => m.UTR >= 9).length }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container analytics-page">
      <h1>Analytics & Statistics</h1>

      <div className="stats-summary">
        <div className="summary-card">
          <h3>{members.length}</h3>
          <p>Total Members</p>
        </div>
        <div className="summary-card">
          <h3>{(members.reduce((sum, m) => sum + m.UTR, 0) / members.length || 0).toFixed(1)}</h3>
          <p>Average UTR</p>
        </div>
        <div className="summary-card">
          <h3>{(members.reduce((sum, m) => sum + m.Age, 0) / members.length || 0).toFixed(0)}</h3>
          <p>Average Age</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h2>Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h2>Age Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h2>UTR Level Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
