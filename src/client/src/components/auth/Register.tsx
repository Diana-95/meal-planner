// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContextProvider';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { api } = useApi();
  
  const handleRegister = async () => {
    const response = await api.users.create(username, email, password);
    console.log('Mock response:', response);
    if(response){
      setUser({username, email, id: response.rowID});
      navigate(routes.calendar);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
    setUsername('');
    setEmail('');
    setPassword('');
    console.log('handle submit');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
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
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
