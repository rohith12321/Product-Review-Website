import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const {
    _id,
    name,
    imageUrl,
    prices = {}
  } = product;

  const handleClick = () => {
    navigate(`/product/${_id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <img src={imageUrl} alt={name} className="product-image" />
      <h3 className="product-name">{name}</h3>

      <div className="product-prices">
        <p><strong>Amazon:</strong> ₹{prices.amazon || '--'}</p>
        <p><strong>Flipkart:</strong> ₹{prices.flipkart || '--'}</p>
      </div>
    </div>
  );
}

export default ProductCard;
