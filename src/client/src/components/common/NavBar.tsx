import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes/routes';
import { useUser } from '../../context/UserContextProvider';

const NavBar = () => {
    const { user, setUser } = useUser();
   
    return (
        <nav style={{ position: 'fixed', zIndex:'100', display: 'flex', flexDirection: 'row', padding: '10px', background: '#eee', borderBottom: '1px solid #ccc' }}>
            <Link to={routes.home} style={{ marginRight: '10px' }}> Home </Link>
            <Link to={routes.calendar} style={{ marginRight: '10px' }}> Calendar </Link>           
            <Link to={routes.dishes} style={{ marginRight: '10px' }}> Recipes </Link>
            <Link to={routes.products}> Products list </Link>
            <h2 style={{ alignSelf:'right', marginLeft: '10px'}}>{user?.username}</h2>
            <button onClick={() => {setUser(null)}} style={{alignSelf:'right', marginLeft: '10px'}}>logout</button>
        </nav>
    )
}
export default NavBar;