import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [data, setData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Loading...');
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBackendStatus();
    fetchUsers();
    fetchData();
  }, []);

  const fetchBackendStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      setBackendStatus('Backend is Connected ✓');
    } catch (err) {
      setBackendStatus('Backend Connection Failed ✗');
      setError('Cannot connect to backend');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data.users);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/data`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/users`, newUser);
      setUsers([...users, response.data]);
      setNewUser({ name: '', email: '' });
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Full-Stack Application</h1>
        <p className="status">{backendStatus}</p>
      </header>

      <main className="container">
        {error && <div className="error-banner">{error}</div>}

        {/* Add User Form */}
        <section className="section">
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser} className="form">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="input"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="input"
            />
            <button type="submit" className="btn">Add User</button>
          </form>
        </section>

        {/* Users List */}
        <section className="section">
          <h2>Users List</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* API Data */}
        {data && (
          <section className="section">
            <h2>API Data</h2>
            <p><strong>Timestamp:</strong> {data.timestamp}</p>
            <ul>
              {data.data.map((item) => (
                <li key={item.id}>{item.value}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
