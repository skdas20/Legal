import React from 'react';
import { Link } from 'react-router-dom';
import PageBackground from '../components/PageBackground';

const NotFound = () => {
  return (
    <PageBackground>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mb-4">
              <h2 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Page not found</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sorry, we couldn't find the page you're looking for.
              </p>
            </div>
            
            <div className="mt-6">
              <Link
                to="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default NotFound; 