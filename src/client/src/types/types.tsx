
export interface Meal {
    id: number;
    name: string;
    startDate: number;
    endDate: number;
}
export interface Ingredient {
    id: number;
    productId: number;
    dishId: number;
    quantity: number;
}
export interface Product {
    id: number,
    name: string,
    measure: string,
    price: number
}
export interface Dish {
    id: number;
    name: string;
    recipe: string;
    imageUrl: string;
    ingredientList: Ingredient[];
}