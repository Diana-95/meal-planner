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
        const [inserted] = await this.db('Dishes')
            .insert({
                name: r.name, 
                recipe: r.recipe, 
                imageUrl: r.imageUrl, 
                userId: r.userId
            })
            .returning("id");
        return typeof inserted === "number" ? inserted : inserted.id;
    
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
            resQuery.whereILike('Dishes.name', `%${searchName}%`);
        }
        if(cursor) {
            resQuery.andWhere('Dishes.id', '>', cursor);
        }
        resQuery.limit(limit);
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
            )
            .where('Dishes.id', id)
            .andWhere('Dishes.userId', userId);
    
        // Check if dish exists - if not, throw error
        if (!rows || rows.length === 0 || !rows[0] || !rows[0].dishId) {
            throw new Error(`Dish with id ${id} not found for user ${userId}`);
        }

        // Get dish info from first row (dish info is the same for all rows)
        const firstRow = rows[0];
        
        // Build ingredient list, filtering out null ingredients (when dish has no ingredients)
        // A dish with no ingredients will have one row with null ingredient fields
        const ingredientList: Ingredient[] = rows
            .filter((row) => row.ingredientId !== null && row.productId !== null && row.productName !== null)
            .map((row) => ({
                id: row.ingredientId,
                product: {
                    id: row.productId,
                    name: row.productName,
                    measure: row.measure,
                    price: row.price,
                    userId: userId
                } as Product,
                dishId: firstRow.dishId,
                quantity: row.quantity || 0,
            } as Ingredient));
    
        const dish: Dish = {
            id: firstRow.dishId,
            name: firstRow.dishName,
            recipe: firstRow.recipe,
            imageUrl: firstRow.imageUrl,
            userId: firstRow.userId,
            ingredientList: ingredientList,
        };
        
        return dish;
    }
}