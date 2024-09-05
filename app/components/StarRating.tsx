import React, { useEffect, useState } from 'react';
import { Ratings } from '../constants';

function StarRating({ allRatings, itemId, sessionId }: { allRatings: Ratings, averageRating: number, itemId: number, sessionId: string }) {
  
  const calculateAverageRating = (allRatings: Ratings) => {
    const totalScore = allRatings.userRatings.map(rating => rating.rating).reduce((a, b) => a + b, 0);
    return totalScore / allRatings.userRatings.length;
  };

  const [userRating, setUserRating] = useState(allRatings.userRatings.filter(userRatings => userRatings.userId == "webApp")[0]?.rating || 0);
  const [avRating, setAverageRating] = useState(calculateAverageRating(allRatings));

  const handleRatingChange = (newRating: number, event: React.MouseEvent | React.TouchEvent) => {
    event.stopPropagation();
    event.preventDefault();
    console.log("New rating: ", newRating);
    setUserRating(newRating);
    submitRating(itemId, newRating);
  };

  const submitRating = (itemId: number, rating: number) => {
    const host = process.env.SIMSCORE_API;
    const processAPI = host + "/update-rating";

    const payload = {
      "idea_index": itemId,
      "session_id": sessionId,
      "rating": rating,
      "user_id": 'webApp'
    }

    fetch(processAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        setAverageRating(data.averageRating);
      });
  };

  return (
    <div className="star-rating">
      <div>Your rating: 
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            onMouseDown={(e) => handleRatingChange(star, e)}
            onTouchStart={(e) => handleRatingChange(star, e)}
            style={{cursor: 'pointer', color: star <= userRating ? 'gold' : 'gray'}}
          >
            ★
          </span>
        ))}
      </div>
      <div>Average rating: {avRating.toFixed(1)}</div>
    </div>
  );
}
export default StarRating;