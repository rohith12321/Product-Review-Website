import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import YourReviews from './pages/YourReviews';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/your-reviews" element={<YourReviews />} />
    </Routes>
  );
}

export default App;
