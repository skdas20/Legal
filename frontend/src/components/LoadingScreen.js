import React, { useState, useEffect, useRef } from 'react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle video loading and errors
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      // Set a timeout in case video doesn't load or play properly
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.log('Video load timeout - forcing completion');
          setIsLoading(false);
          if (onLoadingComplete) onLoadingComplete();
        }
      }, 5000); // 5 seconds timeout
      
      // Cleanup timeout
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, onLoadingComplete]);

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    console.log('Video loaded successfully');
  };

  const handleVideoError = (error) => {
    console.error('Error loading video:', error);
    setIsLoading(false);
    if (onLoadingComplete) onLoadingComplete();
  };

  const handleVideoEnded = () => {
    console.log('Video ended, showing content');
    setIsLoading(false);
    if (onLoadingComplete) onLoadingComplete();
  };

  // If not loading, don't render anything
  if (!isLoading) {
    return null;
  }

  const videoSrc = isMobile ? '/assets/Load2.mp4' : '/assets/Load.mp4';

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {!videoLoaded && (
        <div className="text-center">
          <div className="text-indigo-500 text-3xl font-bold mb-4">DigiLex</div>
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${!videoLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedData={handleVideoLoadedData}
        onEnded={handleVideoEnded}
        onError={handleVideoError}
      />
    </div>
  );
};

export default LoadingScreen; 