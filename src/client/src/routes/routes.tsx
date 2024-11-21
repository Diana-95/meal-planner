import { Dish } from "../types/types";

const routes = {
    home: '/',
    calendar: '/calendar',
    newMeal: '/calendar/new',
    products: '/products',
    newProduct: '/products/new',
    dishes: '/dishes',
    newDish: '/dishes/new',
    editDish: (id: number) => `edit/${id}`,
    editMeal: (id: string | number, start: string, end: string, title: string, dish?: Dish | null) => `edit/${id}/${start}/${end}/${title}/${dish?.id}`,
  };
  
  export default routes;