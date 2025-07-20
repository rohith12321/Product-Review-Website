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
            role="button"
            tabIndex={0}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter') setRating(star);
            }}
        >
          {star <= (hovered || rating) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
