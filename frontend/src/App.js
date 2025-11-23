import React from 'react';
import ProductPage from './pages/ProductPage';

export default function App() {
  return (
    <div className="app-wrapper">
      <div className="container">
        <h1>Inventory Management</h1>
        <ProductPage />
      </div>
    </div>
  );
}
