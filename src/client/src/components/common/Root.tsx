import React, { useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom"
import { useUser } from '../../context/UserContextProvider';
import routes from '../../routes/routes';


const Root = () => {
    const navigate = useNavigate();
    const {user} = useUser();
    useEffect(() => {
      
      if (user) {
        navigate(routes.home); // Automatically redirect to home page if authenticated
      }
      else navigate(routes.authentification);
    }, [navigate, user]);
    return (
        <div className="min-h-screen bg-gray-50">
            <Outlet />
        </div>
    )
}
export default Root;