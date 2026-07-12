import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';

interface MangaCoverProps {
  title: string;
  author: string;
  status: string;
  genres: string[];
  rating: number;
  className?: string;
  coverImageUrl?: string;
}

const MangaCover = ({ title, author, status, genres, rating, className = '', coverImageUrl }: MangaCoverProps) => {
  const [imageError, setImageError] = useState(false);

  const optimizedImageUrl = imageError 
    ? getFallbackCoverImage() 
    : getOptimizedImageUrl(coverImageUrl || getFallbackCoverImage(), 300, 450);

  return (
    <div className={`relative group ${className}`}>
      <div className="relative overflow-hidden rounded-lg shadow-manga hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <img
          src={optimizedImageUrl}
          alt={`${title} cover`}
          loading="lazy"
          className="w-full aspect-[3/4] object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status dot indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div 
            className={`w-3 h-3 rounded-full shadow-lg ${
              status.toLowerCase() === 'ongoing' ? 'bg-green-500' :
              status.toLowerCase() === 'completed' ? 'bg-blue-500' :
              'bg-red-500'
            }`}
            title={status}
          />
        </div>
        
        {/* Rating */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
          ⭐ {rating}/10
        </div>
      </div>
      
      {/* Info overlay on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs border-white/30 text-white">
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MangaCover;