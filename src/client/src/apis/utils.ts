import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/data';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:4000';

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Default enabled
  });

export const axiosInstanceAuth = axios.create({
    baseURL: AUTH_URL,
    withCredentials: true, // Default enabled
  });
