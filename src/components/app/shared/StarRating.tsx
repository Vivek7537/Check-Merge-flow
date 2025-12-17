"use client";

import { Star, StarHalf } from "lucide-react";

type StarRatingProps = {
  rating: number;
  maxStars?: number;
};

export default function StarRating({ rating, maxStars = 5 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${maxStars} stars`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 text-primary fill-primary" />
      ))}
      {hasHalfStar && <StarHalf key="half" className="h-4 w-4 text-primary fill-primary" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground/20 fill-muted-foreground/20" />
      ))}
    </div>
  );
}
