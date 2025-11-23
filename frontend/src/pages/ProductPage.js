import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import ImportExport from '../components/ImportExport';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import HistorySidebar from '../components/HistorySidebar';


export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (query) params.search = query;

      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
    } catch (err) {
      alert('Error fetching products');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, query]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/meta/categories');
      setCategories(res.data.categories || []);
    } catch {}
  };

  // Fetch products whenever query or categoryFilter changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch categories only once on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="layout">
      <div>
        <div className="section">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            placeholder="Search products..."
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <span>
            <ImportExport onImported={fetchProducts} />
          </span>
          <span>
            <ProductForm onSaved={fetchProducts} />
          </span>
        </div>

        <ProductTable
          products={products}
          loading={loading}
          onEdit={fetchProducts}
          onSelect={setSelectedProduct}
          onDelete={fetchProducts}
        />
      </div>

      <div>
        <HistorySidebar product={selectedProduct} />
      </div>
    </div>
  );
}