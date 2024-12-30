import { SqlRepository } from "../sql-repository";
import { Dish } from "../../entity/dish";
import { QueryParams } from "../repository";

export interface DishQuery extends QueryParams{
    nameSearch?: string;
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

    async get(cursor: number|undefined, limit: number, query: DishQuery): Promise<Dish[]> { 

        const{ nameSearch, userId } = query;
        const resQuery = this.db('Dishes')
            .where('userId', userId)
            .select('*');
        if(nameSearch) {
            resQuery.whereLike('name', `%${nameSearch}%`);
        }
        if(cursor) {
            resQuery
            .where('id', '>', cursor)
            .limit(limit);
        } 
        const [dishes] = await resQuery;
        return dishes;
    };

    async getById(id: number, userId: number): Promise<Dish> {
        return await this.db('Dishes')
                        .select('*')
                        .where({
                            'id': id,
                            'userId': userId
                        })
                        .first();
    }
}