import { useState } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from './StarRating';
import './ReviewForm.css';

function ReviewForm({ onReviewAdded }) {
  const { productId } = useParams();
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) {
      setStatus('error');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.REACT_APP_API_URL}/api/products/${productId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: review.trim(), rating }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error('Review submission failed');
      }

      setReview('');
      setRating(5);
      setStatus('success');
      onReviewAdded();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Leave a Review</h3>

      <textarea
        placeholder="Your review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={4}
        required
      />

      <label>Rating:</label>
      <StarRating rating={rating} setRating={setRating} />

      <button type="submit">Submit Review</button>

      {status === 'success' && <p className="success-msg">Review submitted successfully!</p>}
      {status === 'error' && <p className="error-msg">Something went wrong. Try again.</p>}
    </form>
  );
}

export default ReviewForm;
