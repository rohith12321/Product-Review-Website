import { useState } from 'react';

function ReviewForm({ onReviewAdded }) {
  const [name, setName] = useState('');
  const [review, setReview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, review })
    });
    setName('');
    setReview('');
    onReviewAdded();
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Leave a Review</h3>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Your review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        required
      ></textarea>
      <button type="submit">Submit</button>
    </form>
  );
}

export default ReviewForm;
