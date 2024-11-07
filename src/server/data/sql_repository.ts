import { readFileSync } from "fs";
import { Database } from "sqlite3";
import { Repository } from "./repository";
export abstract class SqlRepository<T> implements Repository<T> {
    protected db: Database;
    constructor() {
        this.db = new Database("meals.db");
        this.db.exec(readFileSync("meals.sql").toString(), err => {
            if (err != undefined) throw err;
        });
    }
    abstract create(r: T): Promise<number> ;
    abstract update(r: T): Promise<void>;
    abstract getAll(limit: number): Promise<T[]> ;
    abstract findById(id: number): Promise<T> ;
}