import { Database } from "sqlite3";
import { Repository } from "./repository";

export abstract class SqlRepository<T, I = T> implements Repository<T,I> {
    protected db: Database;
    constructor() {
        this.db = new Database("meals.db");
        this.db.run('PRAGMA foreign_keys = ON;');
    }
    abstract delete(id: number): Promise<void> ;
    abstract create(r: I): Promise<number> ;
    abstract update(r: I): Promise<void> ;
    abstract getAll(limit: number, userId?: number): Promise<T[]> ;
    abstract findById(id: number): Promise<T> ;
}