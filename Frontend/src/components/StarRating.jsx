import React from 'react';
import './StarRating.css';

const StarRating = ({ rating, setRating }) => {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= (hovered || rating) ? 'filled' : ''}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
        >
          {star <= (hovered || rating) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
