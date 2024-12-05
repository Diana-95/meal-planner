
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Login from '../components/authentification/Login';
import Register from '../components/authentification/Register';
import { loginUser, registerUser } from '../apis/usersApi';

import routes from './routes';
import { useUser } from '../context/UserContextProvider';

const Authentification: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (username: string, password: string) => {
    console.log('Logging in:', { username, password });
    loginUser(username, password)
    .then((loggedUser) => {
      // eslint-disable-next-line no-debugger
      debugger
      setUser({username: loggedUser.username, email: loggedUser.email, id: loggedUser.id});
      navigate(routes.calendar);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const handleRegister = (username: string, email: string, password: string) => {
    console.log('Registering:', { username, email, password });
    registerUser(username, email, password)
    .then(({rowID}) => {
      setUser({username, email, id: rowID});
        navigate(routes.calendar);
    })
    .catch((error) => {
      console.log(error);
    });
  }
  return (
    <div>
      {isRegistering ? (
        <Register onRegister={handleRegister} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : 'Create an account'}
      </button>
    </div>
  );
};

export default Authentification;
