import React from 'react';
import { Outlet } from 'react-router-dom';

import NavBar from './NavBar';

const AppAccess = () => {
    return (<>
        <NavBar />
        <Outlet />
        </>);
}

export default AppAccess;