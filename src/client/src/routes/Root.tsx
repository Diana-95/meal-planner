import React, { useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom"
import { useUser } from '../context/UserContextProvider';
import routes from './routes';


const Root = () => {
    const navigate = useNavigate();
    const {user} = useUser();
    useEffect(() => {
      
      if (user) {
        navigate(routes.calendar); // Automatically redirect if authenticated
      }
      else navigate('/auth');
    }, [navigate, user]);
    return (
        <>
        <Outlet />
        </>
    )
}
export default Root;