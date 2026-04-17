import * as React from 'react';
import { Grid, GridColumn as Column, GridToolbar, GridItemChangeEvent } from '@progress/kendo-react-grid';
import { 
    plusIcon, 
    saveIcon, 
    cancelIcon, 
    pencilIcon, 
    trashIcon 
} from '@progress/kendo-svg-icons';
import { Button } from '@progress/kendo-react-buttons';

/**
 * Latest Version Used: v14.3.2 (Release: April 2026)
 * File Purpose: Enterprise Product Management with Inline CRUD
 * Created Date: 2026-04-17
 */

interface Product {
    ProductID: number;
    ProductName: string;
    UnitPrice: number;
    UnitsInStock: number;
    Discontinued: boolean;
    inEdit?: boolean;
}

// Mock Data Service (Internalized for a complete working example)
const initialData: Product[] = [
    { ProductID: 1, ProductName: "Chai", UnitPrice: 18, UnitsInStock: 39, Discontinued: false },
    { ProductID: 2, ProductName: "Chang", UnitPrice: 19, UnitsInStock: 17, Discontinued: false },
    { ProductID: 3, ProductName: "Aniseed Syrup", UnitPrice: 10, UnitsInStock: 13, Discontinued: false }
];

const ProductManagement = () => {
    const [data, setData] = React.useState<Product[]>(initialData);

    // Modern ITEM_CHANGE handler for high-performance editing patterns in v14+
    const onItemChange = (event: GridItemChangeEvent) => {
        const newData = data.map(item =>
            item.ProductID === event.dataItem.ProductID
                ? { ...item, [event.field || '']: event.value }
                : item
        );
        setData(newData);
    };

    const addNew = () => {
        const newItem: Product = { 
            ProductID: data.length > 0 ? Math.max(...data.map(p => p.ProductID)) + 1 : 1, 
            ProductName: "New Product", 
            UnitPrice: 0, 
            UnitsInStock: 0, 
            Discontinued: false, 
            inEdit: true 
        };
        setData([newItem, ...data]);
    };

    const enterEdit = (dataItem: Product) => {
        setData(data.map(item =>
            item.ProductID === dataItem.ProductID ? { ...item, inEdit: true } : item
        ));
    };

    const save = (dataItem: Product) => {
        setData(data.map(item => 
            item.ProductID === dataItem.ProductID ? { ...dataItem, inEdit: undefined } : item
        ));
    };

    const cancel = (dataItem: Product) => {
        // Simple logic to either discard a new row or reset an existing one
        const originalItem = initialData.find(p => p.ProductID === dataItem.ProductID);
        if (originalItem) {
            setData(data.map(item => item.ProductID === dataItem.ProductID ? { ...originalItem, inEdit: undefined } : item));
        } else {
            setData(data.filter(item => item.ProductID !== dataItem.ProductID));
        }
    };

    const remove = (dataItem: Product) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            setData(data.filter(item => item.ProductID !== dataItem.ProductID));
        }
    };

    return (
        <div style={{ padding: '24px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    Product Management Dashboard
                </h1>
                <p style={{ color: '#6b7280', marginTop: '4px' }}>
                    Reference implementation utilizing KendoReact v14.3.2.
                </p>
            </div>

            <Grid
                style={{ 
                    height: '500px', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
                data={data}
                onItemChange={onItemChange}
                editField="inEdit"
            >
                <GridToolbar>
                    <div style={{ padding: '10px' }}>
                        <Button
                            themeColor="primary"
                            svgIcon={plusIcon}
                            onClick={addNew}
                            style={{ paddingLeft: '16px', paddingRight: '16px' }}
                        >
                            Add New Product
                        </Button>
                    </div>
                </GridToolbar>
                
                <Column field="ProductID" title="ID" width="70px" editable={false} />
                <Column field="ProductName" title="Product Name" />
                <Column field="UnitPrice" title="Unit Price" width="180px" editor="numeric" format="{0:C2}" />
                <Column field="UnitsInStock" title="In Stock" width="140px" editor="numeric" />
                <Column field="Discontinued" title="Status" width="120px" editor="boolean" />

                <Column
                    title="Actions"
                    width="180px"
                    cell={(props) => (
                        <td className="k-command-cell" style={{ textAlign: 'center' }}>
                            {!props.dataItem.inEdit ? (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <Button
                                        svgIcon={pencilIcon}
                                        onClick={() => enterEdit(props.dataItem)}
                                        fillMode="flat"
                                        title="Edit"
                                        themeColor="info"
                                    />
                                    <Button
                                        svgIcon={trashIcon}
                                        onClick={() => remove(props.dataItem)}
                                        fillMode="flat"
                                        themeColor="error"
                                        title="Delete"
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <Button
                                        svgIcon={saveIcon}
                                        onClick={() => save(props.dataItem)}
                                        fillMode="outline"
                                        themeColor="primary"
                                        title="Save"
                                    />
                                    <Button
                                        svgIcon={cancelIcon}
                                        onClick={() => cancel(props.dataItem)}
                                        fillMode="outline"
                                        title="Cancel"
                                    />
                                </div>
                            )}
                        </td>
                    )}
                />
            </Grid>
            
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Implementation Checklist</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', fontSize: '14px' }}>
                    <li>Ensure <strong>@progress/kendo-theme-default</strong> is loaded.</li>
                    <li>Use <strong>editField</strong> to track UI state without polluting the domain model.</li>
                    <li>Leverage <strong>SVG Icons</strong> for tree-shaking support.</li>
                    <li>Handle <strong>onItemChange</strong> for real-time validation feedback.</li>
                </ul>
            </div>
        </div>
    );
};

export default ProductManagement;
