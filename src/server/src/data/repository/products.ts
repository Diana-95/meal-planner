import { SqlRepository } from "../sql-repository";
import { Product } from "../../entity/product";
import { QueryParams } from "../repository";
export type ProductInput = Product & { userId: number};

export interface ProductQueryParams extends QueryParams {
    searchName?: string;
}
export class ProductRepository extends SqlRepository<Product, ProductInput> {

    async create(r: Product): Promise<number> {
        const [id] = await this.db('Products').insert({ 
                name: r.name, 
                measure: r.measure, 
                price: r.price, 
                userId: r.userId});
        return id;
    
    }

    async update(r: Product, userId: number): Promise<void> {
        await this.db('Products')
            .where({
                'id': r.id,
                'userId': userId
            })
            .update({
                'name': r.name,
                'price': r.price,
                'measure': r.measure
            });
    }

    async updatePatch(r: Partial<Product>, userId: number): Promise<void> {
        const query = this.db('Products')
        .where({
            'id': r.id,
            'userId': userId
        });
        const updateFields: Record<string, any> = {};

        if(r.name) updateFields.name = r.name;
        if(r.price) updateFields.price = r.price;
        if(r.measure) updateFields.measure = r.measure;
        console.log(updateFields);
        if (Object.keys(updateFields).length > 0) {
            await query.update(updateFields);
        }
    }

    async get(cursor: number|undefined, limit: number, query: ProductQueryParams): Promise<Product[]> {
        const { searchName, userId } = query;
        const resQuery = this.db('Products')
            .where('userId', userId)
            .select('*')
            .limit(limit);
        if(searchName) {
            resQuery.whereLike('name', searchName);
        }
        if( cursor ) {
            resQuery.where('id', '>', cursor);
        }
        return await resQuery;
    };

    async getById(id: number, userId: number): Promise<Product> {
       return await this.db('Products')
                        .select('*')
                        .where({
                            'id': id,
                            'userId':userId
                        })
                        .first();
    };

    async delete(id: number, userId: number): Promise<number> {
        return await this.db('Products')
            .where({
                'id': id,
                'userId':userId
            })
            .del();
    }
}