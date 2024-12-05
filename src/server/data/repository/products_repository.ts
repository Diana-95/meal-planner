import { SqlRepository } from "../sql_repository";
import { Product } from "../../entity/product";
export type ProductInput = Product & { userId: number};

export class ProductRepository extends SqlRepository<Product, ProductInput> {

    async create(r: Product): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.run('INSERT INTO Products (name, measure, price, userId) VALUES (?, ?, ?, ?)', //db.run where no result needed
                [r.name, r.measure, r.price, r.userId],
                function(err){
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    else if(this.lastID !== undefined) resolve(this.lastID);
                    console.log(this.lastID);
                });
        });
    }

    async update(r: Product): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Products
                SET name = ?, price = ? measure = ?
                WHERE id = ?;
            `, 
            [r.name, r.measure, r.price, r.id],
            function(err){
                if (err) {
                    console.log(err.message);
                    reject(err.message);
                }
                resolve();
                console.log(`Row(s) updated: ${this.changes}`);
            });
        });
    }

    async getAll(limit: number, userId: number): Promise<Product[]> { 
        return new Promise<Product[]>((resolve, reject) => {
            this.db.all("SELECT * FROM Products where userId=$userId limit $limit", //db.all returns all rows as a result
                {$limit: limit, $userId: userId},
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                        return;
                    }
                    console.log("getall");
                    console.log(rows);
                    resolve(rows as Product[]);
                }
            );
        });
    };

    async finSuggestedProducts(query: string, limit: number, userId: number): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            this.db.all(`SELECT * FROM Products
                WHERE name LIKE $name AND userId=$userId
                LIMIT $limit ;`, //db.all returns all rows as a result
                {$name: `%${query}%`, $userId: userId, $limit: limit},
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                        return;
                    }
                    console.log("getall");
                    console.log(rows);
                    resolve(rows as Product[]);
                }
            );
        })
    };

    async findById(id: number): Promise<Product> {
        return new Promise<Product>((resolve, reject) => {
            this.db.get("SELECT * FROM Products where id=$id",
                {$id: id},
                (error, row) => {
                    if(error) reject(error.message);
                    else resolve(row as Product);
                }
            )
        })
    };

    async delete(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                DELETE FROM Products
                WHERE id = ?
            `, id,
            function(err){
                if (err) {
                    console.log(err.message);
                    reject(err.message);
                }
                resolve();
                console.log(`Row(s) updated: ${this.changes}`);
            });
        });
    }
}