import { Dish } from "../types/types";

const routes = {
  home: '/app',
  authentification: '/auth',
  profile: '/app/profile',
  calendar: '/app/calendar',
  newMeal: '/app/calendar/new',
  products: '/app/products',
  newProduct: '/app/products/new',
  dishes: '/app/dishes',
  newDish: '/app/dishes/new',
  cart: '/app/cart',
  editDish: (id: number) => `/app/dishes/edit/${id}`,
  editMeal: (id: string | number) => `edit/${id}`,
  viewRecipe: (id: number) => `/app/dishes/view/${id}`,
};

export default routes;