import { useState } from "react";
import StarRating from "../StarRating";

export default function StarRatingExample() {
  const [rating, setRating] = useState(3.5);

  return (
    <div className="flex flex-col gap-4 p-4">
      <StarRating rating={4.5} showNumber />
      <StarRating rating={3.5} size="sm" />
      <StarRating rating={rating} size="lg" interactive onRatingChange={setRating} />
    </div>
  );
}
