import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './ProductPage.css';

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submitMessage, setSubmitMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user.username) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user.username
        },
        credentials: 'include',
        body: JSON.stringify({
          review: newReview,
          rating: newRating
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitMessage("Review added successfully!");
        setNewReview('');
        setNewRating(5);

        const refreshed = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`);
        const refreshedData = await refreshed.json();
        setProduct(refreshedData);
      } else {
        setSubmitMessage(data.message || 'Failed to add review');
      }
    } catch (err) {
      setSubmitMessage("Error submitting review.");
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const rounded = Math.round(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < rounded ? '#f39c12' : '#ccc' }}>★</span>
      );
    }
    return <span>{stars} ({rating})</span>;
  };

  const renderReviews = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return <p>No reviews yet.</p>;
    }

    return (
      <ul className="review-list">
        {reviews.map((r, i) => (
          <li key={i}>
            <strong>{r.username || 'Anonymous'}</strong>: {r.review || r.comment}
            {r.rating && <span> — {r.rating}⭐</span>}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="product-page">
      <h1>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} className="product-image" />
      
      <div className="prices">
        <p><strong>Amazon:</strong> ₹{product.prices?.amazon || '--'} {renderStars(product.amazonAvgRating)}</p>
        <p><strong>Flipkart:</strong> ₹{product.prices?.flipkart || '--'} {renderStars(product.flipkartAvgRating)}</p>
      </div>

      <div className="reviews">
        <h2>Amazon Reviews</h2>
        {renderReviews(product.reviews?.amazon)}

        <h2>Flipkart Reviews</h2>
        {renderReviews(product.reviews?.flipkart)}

        <h2>Custom Reviews</h2>
        {renderReviews(product.reviews?.custom)}

        <h3>Add a Review</h3>
        <form onSubmit={handleReviewSubmit} className="review-form">
          <textarea
            placeholder="Write your review..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            required
          />
          <div>
            Rating: 
            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} required>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <button type="submit">Submit Review</button>
        </form>
        {submitMessage && <p>{submitMessage}</p>}
      </div>
    </div>
  );
}

export default ProductPage;
