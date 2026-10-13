import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div className={`bg-gradient-to-br from-indigo-50 to-slate-100 flex flex-col items-center justify-center p-4 text-slate-400 select-none ${className}`}>
        <Package className="w-10 h-10 mb-2 text-indigo-400 stroke-[1.5]" />
        <span className="text-xs font-medium text-slate-500 text-center line-clamp-2 px-2">
          {alt || 'ShopPulse Product'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <Package className="w-8 h-8 text-slate-300 animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        loading="lazy"
      />
    </div>
  );
};
