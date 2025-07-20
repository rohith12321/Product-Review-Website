import React, { useState } from 'react';
import './HomePage.css';
import Navbar from "../components/NavBar";
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${BASE_URL}/api/products/search?q=${search}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchClick = () => {
    fetchProducts();
  };

  const handleYourReviews = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
      alert('Please login or signup first');
      navigate('/auth');
    } else {
      navigate('/your-reviews');
    }
  };

  return (
    <div>
      <Navbar onYourReviewsClick={handleYourReviews} />
      <div className="homepage-container">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            className="homepage-search"
          />
          <button onClick={handleSearchClick} className="search-button">Search</button>
        </div>

        <div className="product-grid">
          {products.length ? (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="no-products">No products found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
