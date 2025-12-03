import { SqlRepository } from "../sql-repository";
import { Ingredient } from "../../entity/ingredient";
import { QueryParams } from "../repository";

export type IngredientInput = Omit<Ingredient, 'product'> & { productId : number | null};
export interface IngredientQueryParams extends QueryParams{
    dishId?: string;
    productId?: string;
    searchName?: string;
}
export class IngredientRepository extends SqlRepository<Ingredient, IngredientInput> {

    async create(r: IngredientInput): Promise<number> {
        const [inserted] = await this.db('Ingredients')
            .insert({
                productId: r.productId, 
                dishId: r.dishId, 
                quantity: r.quantity
            })
            .returning("id");
        return typeof inserted === "number" ? inserted : inserted.id;
    }

    async update(r: IngredientInput): Promise<void> {
        await this.db('Ingredients')
            .where('id', r.id)
            .update({
                'productId': r.productId,
                'dishId': r.dishId,
                'quantity': r.quantity
            });
    }

    async updatePatch(r: Partial<IngredientInput>): Promise<void> {
        const query = this.db('Ingredients')
            .where('id', r.id);

        const updateFields: Record<string, any> = {};
        if(r.productId) updateFields.productId = r.productId;
        if(r.quantity) updateFields.quantity = r.quantity;
        if(r.dishId) updateFields.dishId = r.dishId;
        await query.update(updateFields);
    }

    async get(cursor: number| undefined, limit: number, query: IngredientQueryParams): Promise<Ingredient[]> { 
        const {dishId, productId, searchName} = query;
        const resQuery = this.db('Ingredients')
            .join('Products', 'Ingredients.productId', 'Products.id')
            .select(
                'Ingredients.id AS id',
                'Ingredients.dishId AS dishId',
                'Ingredients.quantity AS quantity',
                'Products.id AS productId',
                'Products.name AS productName',
                'Products.measure AS measure',
                'Products.price AS price',
                'Products.userId as userId'
            );
        if(dishId) {
            resQuery.where('Ingredients.dishId', dishId);
        }
        if(productId) {
            resQuery.where('Ingredients.productId', productId);
        }
        if(searchName) {
            resQuery.whereILike('Products.name', `%${searchName}%`);
        }
        resQuery.limit(limit);
        const rows = await resQuery;
        return rows.map((row: any) => ({
            id: row.id,
            product: {
                id: row.productId,
                name: row.productName,
                measure: row.measure,
                price: row.price, 
                userId: row.userId
            },
            dishId: row.dishId,
            quantity: row.quantity
        }));
    };

    async getById(id: number): Promise<Ingredient> {
        return await this.db('Ingredients')
                        .select('*')
                        .where({
                            'id': id
                        })
                        .first();
    }

    async delete(id: number): Promise<number> {
        return this.db('Ingredients')
            .where({
                'id': id
            })
            .del();
    }
}