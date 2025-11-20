export interface Product {
    id: number,
    name: string,
    measure: string,
    price: number,
    emoji?: string | null,
    userId: number
}