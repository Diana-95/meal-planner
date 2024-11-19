import React from 'react';
import { Link } from 'react-router-dom';
import routes from './routes';

const NavBar = () => {
    return (
        <nav style={{ padding: '10px', background: '#eee', borderBottom: '1px solid #ccc' }}>
            <Link to={routes.home} style={{ marginRight: '10px' }}> Home </Link>
            <Link to={routes.calendar} style={{ marginRight: '10px' }}> Calendar </Link>           
            <Link to={routes.dishes} style={{ marginRight: '10px' }}> Recipes </Link>
            <Link to={routes.products}> Products list </Link>
        </nav>
    )
}
export default NavBar;