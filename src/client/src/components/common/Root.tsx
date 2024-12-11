import React, { useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom"
import { useUser } from '../../context/UserContextProvider';
import routes from '../../routes/routes';


const Root = () => {
    const navigate = useNavigate();
    const {user} = useUser();
    useEffect(() => {
      
      if (user) {
        navigate(routes.calendar); // Automatically redirect if authenticated
      }
      else navigate(routes.authentification);
    }, [navigate, user]);
    return (
        <>
        <Outlet />
        </>
    )
}
export default Root;