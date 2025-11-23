import React, { useState, useEffect } from 'react';
import ProductPage from './pages/ProductPage';
import Login from './components/Auth/Login';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (username && token) setUser(username);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app-wrapper">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Inventory Management</h1>
          <div>
            <span style={{ marginRight: 15 }}>Welcome, {user}!</span>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <ProductPage />
      </div>
    </div>
  );
}