import React from 'react';
import Root from '../../components/common/Root';
import { ApiContextProvider } from '../../context/ApiContextProvider';


const RootPage = () => {
    return (
        <ApiContextProvider>
            <Root />
        </ApiContextProvider>
        
    )
}
export default RootPage;