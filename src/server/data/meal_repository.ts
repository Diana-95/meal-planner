import { SqlRepository } from "./sql_repository";
import { Meal } from "../entity/meal";


export class MealRepository extends SqlRepository<Meal> {

    async create(r: Meal): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.db.run('INSERT INTO Meals (name, startDate, endDate) VALUES (?, ?, ?)', //db.run where no result needed
                [r.name, r.startDate, r.endDate],
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

    async update(r: Meal): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`
                UPDATE Meals
                SET name = ?, startDate = ?, endDate = ?
                WHERE id = ?;
            `, 
            [r.name, r.startDate, r.endDate, r.id],
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

    async getAll(limit: number): Promise<Meal[]> { 
        return new Promise<Meal[]>((resolve, reject) => {
            this.db.all("SELECT * FROM Meals limit $limit", //db.all returns all rows as a result
                {$limit: limit},
                (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                        return;
                    }
                    console.log("getall");
                    console.log(rows);
                    resolve(rows as Meal[]);
                }
            );
        });
    };

    async findById(id: number): Promise<Meal> {
        return new Promise<Meal>((resolve, reject) => {
            this.db.get("SELECT * FROM Meals where id=$id",
                {$id: id},
                (error, row) => {
                    if(error) reject(error.message);
                    else resolve(row as Meal);
                }
            )
        })
    }

    async executeQuery(sql: string, params: any): Promise<Meal[]> {
        return new Promise<Meal[]>((resolve, reject) => {
            this.db.all<Meal>(sql, params, (err, rows) => {
                if (err == undefined) {
                    resolve(rows);
                } else {
                    reject(err);
                }
            })
        });
    }
}