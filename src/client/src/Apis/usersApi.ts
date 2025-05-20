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
  const response = await axiosInstanceAuth.post<User>
  ('/login', {
    username,
    password
  }
  );
  console.log("login_response: ",response);
  return response.data;
}

export const updateUser = async(username: string, email: string, password: string) => {
  const response = await axiosInstanceAuth.put<{ success: boolean }>
  (`/api/me`, {
    username,
    email,
    password
  }
  );
  console.log("login_response: ",response);
  return response.data;
}

export const updateUserPart = async(username?: string, email?: string, password?: string) => {
  const response = await axiosInstanceAuth.patch<void>
  (`/api/me`, {
    username,
    email,
    password
  }
  );
  return response.data;
}

export const getCurrentUser = async() => {
  const response = await axiosInstanceAuth.get<User>
    ('/api/me');
  return response.data;
}