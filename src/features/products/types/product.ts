export interface Product {
    ProductID: number;
    ProductName: string;
    UnitPrice: number;
    UnitsInStock: number;
    Discontinued: boolean;
    inEdit?: boolean;
}
