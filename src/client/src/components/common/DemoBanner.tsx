import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';

const DemoBanner = () => {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <svg 
            className="w-5 h-5 text-yellow-600 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="text-sm text-yellow-800">
            You're viewing demo data in read-only mode.
          </p>
        </div>
        <Link
          to={routes.authentification}
          className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
        >
          Register to create your own account
        </Link>
      </div>
    </div>
  );
};

export default DemoBanner;
