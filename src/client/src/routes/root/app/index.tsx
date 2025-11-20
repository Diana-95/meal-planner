import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../../../components/common/NavBar';


const AppAccess = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
}

export default AppAccess;