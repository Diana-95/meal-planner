import { Dish } from "../types/types";

const routes = {
  home: '/',
  authentification: '/auth',
  calendar: '/app/calendar',
  newMeal: '/app/calendar/new',
  products: '/app/products',
  newProduct: '/app/products/new',
  dishes: '/app/dishes',
  newDish: '/app/dishes/new',
  editDish: (id: number) => `edit/${id}`,
  editMeal: (id: string | number) => `edit/${id}`,
};

export default routes;