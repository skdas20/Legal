import React, { useState, useEffect } from 'react';

const PageBackground = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if device is mobile and if dark mode is enabled
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const checkIfDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial checks
    checkIfMobile();
    checkIfDarkMode();

    // Add event listeners
    window.addEventListener('resize', checkIfMobile);
    
    // Check for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkIfDarkMode();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      observer.disconnect();
    };
  }, []);

  // Determine which background image to use
  const getBackgroundImage = () => {
    if (isMobile) {
      return isDarkMode ? '/assets/h1.png' : '/assets/h2.png';
    } else {
      return isDarkMode ? '/assets/Home2.png' : '/assets/Home.png';
    }
  };

  const backgroundStyle = {
    backgroundImage: `url('${getBackgroundImage()}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh'
  };

  return (
    <div className="relative" style={backgroundStyle}>
      {children}
    </div>
  );
};

export default PageBackground; 