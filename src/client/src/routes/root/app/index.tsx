import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../../../components/common/NavBar';
import Footer from '../../../components/common/Footer';


const AppAccess = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default AppAccess;