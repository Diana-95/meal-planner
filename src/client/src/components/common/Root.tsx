import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useUser } from '../../context/UserContextProvider';
import routes from '../../routes/routes';
import DemoBanner from './DemoBanner';


const Root = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, isDemoMode} = useUser();
    
    useEffect(() => {
      const currentPath = location.pathname;
      const isAuthPage = currentPath === routes.authentification || currentPath === '/';
      const isAppPage = currentPath.startsWith('/app');
      
      if (user) {
        // Only redirect to home if we're on the auth page or root
        // Don't redirect if already on an app page
        if (isAuthPage) {
          navigate(routes.home, { replace: true });
        }
      } else {
        // Only redirect to auth if we're trying to access app pages
        // Don't redirect if already on auth page
        if (isAppPage && !isAuthPage) {
          navigate(routes.authentification, { replace: true });
        }
      }
    }, [navigate, user, location.pathname]);
    
    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {isDemoMode && <DemoBanner />}
            <Outlet />
        </div>
    )
}
export default Root;