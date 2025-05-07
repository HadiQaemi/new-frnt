import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "",
  className = ""
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);

  const handleImageLoad = (type: 'thumbnail' | 'fullscreen') => {
    if (type === 'thumbnail') {
      setThumbnailLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setIsLoading(true);
    }
  };

  return (
    <>
      <div className="relative inline-block">
        {thumbnailLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="animate-spin text-gray-500" size={24} />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onClick={toggleFullScreen}
          onLoad={() => handleImageLoad('thumbnail')}
          loading="lazy"
          className={`cursor-pointer transition-transform hover:scale-[1.015] ${className} ${thumbnailLoading ? 'opacity-0' : 'opacity-100'
            }`}
        />
      </div>

      {isFullScreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={toggleFullScreen}
        >
          <button
            onClick={toggleFullScreen}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>

          <div className="relative max-h-screen max-w-screen overflow-hidden p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
              </div>
            )}
            <img
              src={src}
              alt={alt}
              onLoad={() => handleImageLoad('fullscreen')}
              className={`max-w-screen max-h-screen bg-white transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                }`}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;