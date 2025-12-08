import { axiosInstanceAuth } from './utils';
import { User } from '../types/types';

export const registerUser = async (username: string, email: string, password: string) => {
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
  // Don't log full response - may contain sensitive data
  console.log("login_response: success");
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
  // Don't log full response - may contain sensitive data
  console.log("login_response: success");
  return response.data;
}

export const updateUserPart = async(username?: string, email?: string, password?: string, oldPassword?: string) => {
  const response = await axiosInstanceAuth.patch<void>
  (`/api/me`, {
    username,
    email,
    password,
    oldPassword
  }
  );
  return response.data;
}

export const getCurrentUser = async() => {
  const response = await axiosInstanceAuth.get<User>
    ('/api/me');
  return response.data;
}