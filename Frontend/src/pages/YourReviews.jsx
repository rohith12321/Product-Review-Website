import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './YourReviews.css';
import { Link } from 'react-router-dom';

const YourReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/reviews`, {
      headers: {
        'x-username': user?.username
      },
      withCredentials: true
    })
    .then(res => setReviews(res.data.data))
    .catch(err => setError('Error fetching reviews'));
  }, []);

  const handleDelete = async (productId, reviewId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/review/${reviewId}`, {
        headers: {
          'x-username': user?.username
        },
        withCredentials: true
      });
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch {
      alert('Error deleting review');
    }
  };

  const handleEdit = async (productId, reviewId, oldReview, oldRating) => {
    const newReview = prompt("Edit your review:", oldReview);
    if (newReview === null) return;

    const newRating = prompt("Edit your rating (1-5):", oldRating);
    if (newRating === null || isNaN(newRating)) return;

    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/review/${reviewId}`,
        { review: newReview, rating: newRating },
        {
          headers: { 'x-username': user?.username },
          withCredentials: true
        }
      );
      setReviews(reviews.map(r =>
        r._id === reviewId ? { ...r, review: newReview, rating: newRating } : r
      ));
    } catch {
      alert('Error editing review');
    }
  };

  return (
    <div className="your-reviews-container">
      <h2 className="your-reviews-title">Your Reviews</h2>
      {error && <p>{error}</p>}
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="review-list">
          {reviews.map(r => (
            <li key={r._id} className="review-item">
              <Link to={`/product/${r.productId}`}>
                <strong>{r.productName}</strong>
              </Link>
              <p>Rating: {r.rating} ⭐</p>
              <p>{r.review}</p>
              <div className="review-buttons">
                <button onClick={() => handleEdit(r.productId, r._id, r.review, r.rating)}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(r.productId, r._id)}>
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default YourReviews;
