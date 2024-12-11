import React from 'react';
import { createBrowserRouter, RouterProvider} from 'react-router-dom';

import RootPage from './routes/root'; 

import Authentification from './routes/root/auth';
import AppAccess from './routes/root/app';
import Calendar, { mealsLoader } from './routes/root/app/calendar';
import Products, { productsLoader } from './routes/root/app/products/index';
import Dishes, { dishesLoader } from './routes/root/app/dishes';

import EditMeal from './components/calendar/EditMealWindow';
import NewMeal from './components/calendar/NewMealWindow';
import ErrorPage from './components/dishes/ErrorPage';


import EditDish, { dishLoader } from './components/dishes/EditDish';
import NewDish from './components/dishes/NewDish';

import NewProduct from './components/products/NewProduct';

import { UserContextProvider } from './context/UserContextProvider';




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
            path: 'calendar',
            element: <Calendar />,
            errorElement: <ErrorPage />,
            loader: mealsLoader,
            children: [
            { 
              path: 'new', 
              element: <NewMeal /> 
            },
            {
              path: 'edit/:id/:startTime/:endTime/:title/:dish',
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
            loader: dishesLoader,
            children: [
              { 
                path: 'new', 
                element: <NewDish /> 
              },
              {
                path: 'edit/:id',
                element: <EditDish />,
                errorElement: <ErrorPage />,
                loader: dishLoader,
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
          }
        ]
      }
    ] 
  }
]);

function App() {

  return <UserContextProvider>
          <RouterProvider router={router} />
        </UserContextProvider>
}

export default App;
