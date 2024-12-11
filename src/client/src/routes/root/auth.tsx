
import React, { useState } from 'react';


import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';


const Authentification: React.FC = () => {

  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div>
      {isRegistering ? (
        <Register  />
      ) : (
        <Login />
      )}
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : 'Create an account'}
      </button>
    </div>
  );
};

export default Authentification;
