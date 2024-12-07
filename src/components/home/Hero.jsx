import React from 'react';

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to HealthFlexx
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mb-8">
          Your comprehensive guide to health, wellness, and personal growth. Discover expert insights on nutrition, fitness, and mindful living.
        </p>
        <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-dark bg-white hover:bg-gray-50 transition-colors">
          Get Started
          <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}