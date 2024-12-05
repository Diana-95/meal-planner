import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';

import CalendarPage, { mealsLoader } from './routes/CalendarPage';

import EditMeal from './components/calendar/EditMeal';
import NewMeal from './components/calendar/NewMeal';
import ErrorPage from './components/recipes/ErrorPage';
import Root from './routes/Root';
import Dishes, { dishesLoader } from './routes/Dishes';
import EditDish, { dishLoader } from './components/recipes/EditDish';
import NewDish from './components/recipes/NewDish';

import NewProduct from './components/products/NewProduct';
import Products, { productsLoader } from './routes/Products';
import Authentification from './routes/Authentification';
import AppAccess from './routes/AppAccess';
import { UserContextProvider } from './context/UserContextProvider';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: '/auth',
        element: <Authentification />
      },
      {
        path: '/app',
        element: <AppAccess />,
        children: [
          {
            path: 'calendar',
            element: <CalendarPage />,
            errorElement: <ErrorPage />,
            loader: mealsLoader,
            children: [
            { path: 'new', element: <NewMeal /> },
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
              { path: 'new', element: <NewDish /> },
                {
                  path: 'edit/:id',
                  element: <EditDish />,
                  errorElement: <ErrorPage />,
                  // action: changeTodoAction,
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
              { path: 'new', 
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
