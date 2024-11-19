import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import CalendarPage, { mealsLoader } from './routes/CalendarPage';

import EditMeal from './components/calendar/EditMeal';
import NewMeal from './components/calendar/NewMeal';
import ErrorPage from './components/recipes/ErrorPage';
import Root from './routes/Root';
import Dishes, { dishesLoader } from './routes/Dishes';
import EditDish, { dishLoader } from './components/recipes/EditDish';
import NewDish from './components/recipes/NewDish';

import NewProduct from './components/groceries/NewProduct';
import Products, { productsLoader } from './routes/Products';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/calendar',
        element: <CalendarPage />,
        errorElement: <ErrorPage />,
        loader: mealsLoader,
        children: [
        { path: 'new', element: <NewMeal /> },
          {
            path: 'edit/:id/:startTime/:endTime/:title',
            element: <EditMeal />,
            // action: changeTodoAction,
            // loader: todoLoader,
          },
        ]
      },
      {
        path: '/dishes',
        element: <Dishes />,
        loader: dishesLoader,
        children: [
          { path: 'new', element: <NewDish /> },
            {
              path: 'edit/:id',
              element: <EditDish />,
              // action: changeTodoAction,
              loader: dishLoader,
            },
          ]
      },
      {
        path: '/products',
        element: <Products />,
        loader: productsLoader,
        children: [
          { path: 'new', element: <NewProduct /> }
        ]
      }
    ]
    
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
