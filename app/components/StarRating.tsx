import React, { useState } from 'react';

function StarRating({ userRating, averageRating, itemId }: { userRating: number, averageRating: number, itemId: string }) {
  const [rating, setRating] = useState(userRating);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    // submitRating(itemId, newRating);
  };

  return (
    <div className="star-rating">
      <div>Your rating: 
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            onClick={() => handleRatingChange(star)}
            style={{cursor: 'pointer', color: star <= rating ? 'gold' : 'gray'}}
          >
            ★
          </span>
        ))}
      </div>
      <div>Average rating: {averageRating.toFixed(1)}</div>
    </div>
  );
}
export default StarRating;