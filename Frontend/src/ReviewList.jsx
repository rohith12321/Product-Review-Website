function ReviewList({ reviews }) {
  return (
    <div className="review-list">
      <h3>All Reviews</h3>
      {reviews.map((rev, index) => (
        <div key={index} className="review-item">
          <strong>{rev.name}</strong>
          <p>{rev.review}</p>
        </div>
      ))}
    </div>
  );
}

export default ReviewList;

