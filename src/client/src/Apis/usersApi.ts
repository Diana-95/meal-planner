import { axiosInstanceAuth } from './utils';
import { User } from '../types/types';

export const registerUser = async (username: string, email: string, password: string) => {
  console.log('/register', username, email, password);
    const response = await axiosInstanceAuth.post<{ rowID: number }>('/register', {
      username,
      email,
      password
    },
    { withCredentials: true });
    console.log(response.data);
    return response.data;
}

export const loginUser = async (username: string, password: string) => {
  const response = await axiosInstanceAuth.post<
  {id: number, username: string, email: string, role?: string}>
  ('/login', {
    username,
    password
  }
  );
  console.log("login_response: ",response);
  return response.data;
}

export const getCurrentUser = async() => {
  const response = await axiosInstanceAuth.get<User>
    ('/api/me');
  return response.data;
}