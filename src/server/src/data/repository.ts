
export interface QueryParams {
    userId?: number;
}
export interface Repository<T, I=T> {
    create(r: I): Promise<number>;
    update(r: I, userId:  number): Promise<void>;
    get(cursor: number|undefined, limit: number, query?: QueryParams): Promise<T[]>;
    getById(id: number, userId: number): Promise<T> ; 
    delete(id: number, userId:  number): Promise<number>;
}