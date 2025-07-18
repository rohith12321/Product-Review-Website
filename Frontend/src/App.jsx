import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import YourReviews from './pages/YourReviews';
import Navbar from './components/NavBar';

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/your-reviews" element={<YourReviews />} />
      </Routes>
    </div>
  );
};

export default App;
