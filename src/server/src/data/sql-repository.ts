
import { Knex } from "knex";

import { db as sharedDb } from "./knex-client";
import { QueryParams, Repository } from "./repository";

export abstract class SqlRepository<T, I = T> implements Repository<T, I> {
    protected db: Knex;
    constructor() {
        this.db = sharedDb;
    }
    abstract delete(id: number, userId:  number): Promise<number> ;
    abstract create(r: I): Promise<number> ;
    abstract update(r: I, userId:  number): Promise<void> ;
    abstract get(cursor: number|undefined, limit: number, query?: QueryParams): Promise<T[]> ;
    abstract getById(id: number, userId:  number): Promise<T> ; 
}