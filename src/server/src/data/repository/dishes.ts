import { SqlRepository } from "../sql-repository";
import { Dish } from "../../entity/dish";
import { QueryParams } from "../repository";
import { Ingredient } from "../../entity/ingredient";
import { Product } from "../../entity/product";

export interface DishQuery extends QueryParams{
    searchName?: string;
}
export class DishRepository extends SqlRepository<Dish> {
 
    async delete(id: number, userId: number): Promise<number> {
        return await this.db('Dishes')
            .where({
                'id': id,
                'userId':userId
            })
            .del();
    }

    async create(r: Dish): Promise<number> {
        const [id] = await this.db('Dishes')
            .insert({
                name: r.name, 
                recipe: r.recipe, 
                imageUrl: r.imageUrl, 
                userId: r.userId
            });
        return id;
    
    }

    async update(r: Dish, userId: number): Promise<void> {
        await this.db('Dishes')
            .where({
                'id': r.id,
                'userId': userId
            })
            .update({
                'name': r.name,
                'recipe': r.recipe,
                'imageUrl': r.imageUrl
            });

    }

    async updatePatch(r: Partial<Dish>, userId: number): Promise<void> {
        const query = this.db('Dishes')
                .where({
                    'id': r.id,
                    'userId': userId
        });
        const updateFields: Record<string, any> = {};
        if(r.imageUrl) updateFields.imageUrl = r.imageUrl;
        if(r.name) updateFields.name = r.name;
        if(r.recipe) updateFields.recipe = r.recipe;

        await query.update(updateFields);
    }

    groupDishesWithIngredients = (rows: any[]) => {
        const dishesMap = new Map();
      
        rows.forEach((row: any) => {
          // Check if the dish is already added
          if (!dishesMap.has(row.dishId)) {
            dishesMap.set(row.dishId, {
              id: row.dishId,
              name: row.dishName,
              recipe: row.recipe,
              imageUrl: row.imageUrl,
              userId: row.userId,
              ingredientList: [],
            } as Dish);
          }
      
          // Add the ingredient to the corresponding dish
          if (row.ingredientId) {
            dishesMap.get(row.dishId).ingredientList.push({
              id: row.ingredientId,
              product: ({
                id: row.productId,
                name: row.productName,
                measure: row.measure,
                price: row.price,
              } as Product),
              quantity: row.quantity,
            } as Ingredient);
          }
        });
      
        // Convert the Map to an array of dishes
        return Array.from(dishesMap.values());
      }
      
    async get(cursor: number|undefined, limit: number, query: DishQuery): Promise<Dish[]> { 

        const{ searchName, userId } = query;
        const resQuery = this.db('Dishes')
            .leftJoin('Ingredients', 'Dishes.id', 'Ingredients.dishId')
            .leftJoin('Products', 'Ingredients.productId', 'Products.id')
            .select(
            'Dishes.id as dishId',
            'Dishes.name as dishName',
            'Dishes.recipe',
            'Dishes.imageUrl',
            'Dishes.userId as userId',
            'Ingredients.id as ingredientId',
            'Ingredients.productId',
            'Ingredients.quantity',
            'Products.name as productName',
            'Products.id as productId',
            'Products.measure',
            'Products.price' 
        )
        .where('Dishes.userId', userId); // Filter by userId

        if(searchName) {
            resQuery.whereLike('dishName', `%${searchName}%`);
        }
        if(cursor) {
            resQuery
            .andWhere('id', '>', cursor)
            .limit(limit);
        } 
        const rows = await resQuery;
        return this.groupDishesWithIngredients(rows);
    };

    async getById(id: number, userId: number): Promise<Dish> {
        const rows = await this.db('Dishes')
            .leftJoin('Ingredients', 'Dishes.id', 'Ingredients.dishId')
            .leftJoin('Products', 'Ingredients.productId', 'Products.id')
            .select(
            'Dishes.id as dishId',
            'Dishes.name as dishName',
            'Dishes.recipe',
            'Dishes.imageUrl',
            'Dishes.userId as userId',
            'Ingredients.id as ingredientId',
            'Ingredients.productId',
            'Ingredients.quantity',
            'Products.name as productName',
            'Products.id as productId',
            'Products.measure',
            'Products.price' 
            // id: number,
            // name: string,
            // measure: string,
            // price: number, 
            // userId: number
            )
            .where('Dishes.id', id) // Use the actual column name from the `Dishes` table
            .andWhere('Dishes.userId', userId); // Filter by userId
    
        const dish: Dish = {
            id: rows[0].dishId,
            name: rows[0].dishName,
            recipe: rows[0].recipe,
            imageUrl: rows[0].imageUrl,
            ingredientList: rows.map((row) => ({
              id: row.ingredientId,
              product: ({
                id: row.productId,
                name: row.productName,
                measure: row.measure,
                price: row.price
              } as Product),
              dishId: rows[0].dishId,
              quantity: row.quantity,

            })),
          };
        
        return dish;
    }
}