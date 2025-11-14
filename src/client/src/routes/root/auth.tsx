
import React, { useState } from 'react';


import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';


const Authentification: React.FC = () => {

  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="relative">
      {isRegistering ? (
        <Register  />
      ) : (
        <Login />
      )}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
        >
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};

export default Authentification;
