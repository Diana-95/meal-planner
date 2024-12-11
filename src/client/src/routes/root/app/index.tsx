import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../../../components/common/NavBar';


const AppAccess = () => {
    return (<>
        <NavBar />
        <Outlet />
        </>);
}

export default AppAccess;