import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className = '', ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // High quality fallback tech graphic if image link fails
  const fallbackSrc = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={`relative overflow-hidden bg-slate-900 flex items-center justify-center ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center text-cyan-400/50">
          <Cpu className="w-8 h-8 animate-spin" />
        </div>
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
