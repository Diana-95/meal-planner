import { Dish } from "../types/types";

const routes = {
    authentification: '/auth',
    home: '/',
    calendar: '/app/calendar',
    newMeal: '/app/calendar/new',
    products: '/app/products',
    newProduct: '/app/products/new',
    dishes: '/app/dishes',
    newDish: '/app/dishes/new',
    editDish: (id: number) => `edit/${id}`,
    editMeal: (id: string | number, start: string, end: string, title: string, dish?: Dish | null) => `edit/${id}/${start}/${end}/${title}/${dish?.id}`,
  };
  
  export default routes;