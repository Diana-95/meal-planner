// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContextProvider';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { api, loading } = useApi();
  const { setUser } = useUser();
  
  const handleLogin = async () => {
  
    const loggedUser = await api.users.login(username, password);
    if(loggedUser){
      setUser(loggedUser);
      navigate(routes.calendar);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
    setUsername('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit} >
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
      <button type="submit" disabled={loading} >{loading? 'Sumbitting': 'Login'}</button>
    </form>
  );
};

export default Login;
