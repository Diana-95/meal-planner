import React from 'react';
import Root from '../../components/common/Root';
import { ApiContextProvider } from '../../context/ApiContextProvider';
import { UserContextProvider } from '../../context/UserContextProvider';
import { ToastContainer } from 'react-toastify';


const RootPage = () => {
    return (
         <ApiContextProvider>
             <UserContextProvider>
                <ToastContainer />
                <Root />
            </UserContextProvider>
         </ApiContextProvider>
    )
}
export default RootPage;