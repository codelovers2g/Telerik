import { Product } from '../types/product';

export const initialData: Product[] = [
    { ProductID: 1, ProductName: "Chai", UnitPrice: 18, UnitsInStock: 39, Discontinued: false },
    { ProductID: 2, ProductName: "Chang", UnitPrice: 19, UnitsInStock: 17, Discontinued: false },
    { ProductID: 3, ProductName: "Aniseed Syrup", UnitPrice: 10, UnitsInStock: 13, Discontinued: false },
    { ProductID: 4, ProductName: "Chef Anton's Gumbo Mix", UnitPrice: 21.35, UnitsInStock: 0, Discontinued: true },
    { ProductID: 5, ProductName: "Grandma's Boysenberry Spread", UnitPrice: 25, UnitsInStock: 120, Discontinued: false }
];
