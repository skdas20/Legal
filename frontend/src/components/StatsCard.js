import React, { useState, useEffect } from 'react';

const StatsCard = ({ title, value, icon, color = 'indigo', change, changeType = 'increase', isLoading = false }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (isLoading) return;
    
    const duration = 1500; // Animation duration in ms
    const steps = 60; // Number of steps in the animation
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easedProgress * value));
      
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value, isLoading]);
  
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      icon: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-600 dark:text-rose-400',
      icon: 'bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-300'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
    }
  };
  
  const selectedColor = colorClasses[color] || colorClasses.indigo;
  
  return (
    <div className={`${selectedColor.bg} rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-full p-3 ${selectedColor.icon}`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd>
              <div className="flex items-baseline">
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <>
                    <div className={`text-2xl font-semibold ${selectedColor.text}`}>
                      {displayValue.toLocaleString()}
                    </div>
                    {change && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        changeType === 'increase' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {changeType === 'increase' ? (
                          <svg className="self-center flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="self-center flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="sr-only">
                          {changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {change}
                      </div>
                    )}
                  </>
                )}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 