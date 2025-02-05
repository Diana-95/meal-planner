// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginUser } from '../../apis/usersApi';
import { useUser } from '../../context/UserContextProvider';
import routes from '../../routes/routes';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();
  
  const handleLogin = () => {
    console.log('Logging in:', { username, password });
    loginUser(username, password)
    .then((loggedUser) => {

      setUser({username: loggedUser.username, email: loggedUser.email, id: loggedUser.id});
      navigate(routes.calendar);
    })
    .catch((error) => {
      console.log(error);
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
    setUsername('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
