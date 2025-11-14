import React from 'react';
import { createBrowserRouter, RouterProvider} from 'react-router-dom';
import { UserContextProvider } from './context/UserContextProvider';

import RootPage from './routes/root'; 

import Authentification from './routes/root/auth';
import AppAccess from './routes/root/app';
import HomePage from './components/home/HomePage';
import Calendar from './routes/root/app/calendar';
import Products, { productsLoader } from './routes/root/app/products/index';
import Dishes from './routes/root/app/dishes';
import ShoppingCart from './components/cart/ShoppingCart';

import EditMeal from './components/calendar/EditMealWindow';
import NewMeal from './components/calendar/NewMealWindow';
import ErrorPage from './components/dishes/ErrorPage';


import EditDish from './components/dishes/EditDish';
import NewDish from './components/dishes/NewDish';

import NewProduct from './components/products/NewProduct';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootPage />,
    children: [
      { 
        path: '/auth',
        element: <Authentification />
      },
      {
        path: '/app',
        element: <AppAccess />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'calendar',
            element: <Calendar />,
            errorElement: <ErrorPage />,
            children: [
            { 
              path: 'new', 
              element: <NewMeal /> 
            },
            {
              path: 'edit/:id',
              element: <EditMeal />,
              errorElement: <ErrorPage />,
              // action: changeTodoAction,
              // loader: todoLoader,
            },
            ]
          },
          {
            path: 'dishes',
            element: <Dishes />,
            errorElement: <ErrorPage />,
            children: [
              { 
                path: 'new', 
                element: <NewDish /> 
              },
              {
                path: 'edit/:id',
                element: <EditDish />,
                errorElement: <ErrorPage />,
              },
              ]
          },
          {
            path: 'products',
            element: <Products />,
            errorElement: <ErrorPage />,
            loader: productsLoader,
            children: [
              { 
                path: 'new', 
                element: <NewProduct/>, 
                errorElement: <ErrorPage />,
              }
            ]
          },
          {
            path: 'cart',
            element: <ShoppingCart />,
            errorElement: <ErrorPage />,
          }
        ]
      }
    ] 
  }
]);

function App() {

  return <RouterProvider router={router} />
}

export default App;
