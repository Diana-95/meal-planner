export interface Ingredient {
    id: number;
    product: Product;
    dishId: number;
    quantity: number;
}
export interface Dish {
    id: number;
    name: string;
    recipe: string;
    imageUrl: string;
    ingredientList: Ingredient[];
}
export interface Meal {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    dish: Dish | null;
}

export interface Product {
    id: number,
    name: string,
    measure: string,
    price: number
}
export interface User {
    id: number;
    username: string;
    email: string;
    role?: string; // Optional role
  }