import * as React from 'react';
import { 
    Grid, 
    GridColumn as Column, 
    GridToolbar, 
    GridItemChangeEvent, 
    GridCellProps, 
    GridEditChangeEvent 
} from '@progress/kendo-react-grid';
import { EditDescriptor } from '@progress/kendo-react-data-tools';
import { 
    plusIcon, 
    saveIcon, 
    cancelIcon, 
    pencilIcon, 
    trashIcon 
} from '@progress/kendo-svg-icons';
import { Button } from '@progress/kendo-react-buttons';

import { Product } from './types/product';
import { initialData } from './data/mock-products';

const ProductManagement = () => {
    const [data, setData] = React.useState<Product[]>(initialData);
    const [editDescriptor, setEditDescriptor] = React.useState<EditDescriptor>({});

    // Leveraging modern state-update patterns 
    // for complex logic with minimal overhead.
    // Use of 'useCallback' prevents unnecessary re-renders.
    const onItemChange = React.useCallback((event: GridItemChangeEvent) => {
        setData(prevData => prevData.map(item =>
            item.ProductID === event.dataItem.ProductID
                ? { ...item, [event.field || '']: event.value }
                : item
        ));
    }, []);

    const onEditChange = React.useCallback((event: GridEditChangeEvent) => {
        setEditDescriptor(event.edit);
    }, []);

    const addNew = React.useCallback(() => {
        setData(prevData => {
            const newItem: Product = { 
                ProductID: prevData.length > 0 ? Math.max(...prevData.map((p: Product) => p.ProductID)) + 1 : 1, 
                ProductName: "New Product", 
                UnitPrice: 0, 
                UnitsInStock: 0, 
                Discontinued: false
            };
            setEditDescriptor(prevEdit => ({ ...prevEdit, [newItem.ProductID]: true }));
            return [newItem, ...prevData];
        });
    }, []);

    const enterEdit = React.useCallback((dataItem: Product) => {
        setEditDescriptor(prevEdit => ({ ...prevEdit, [dataItem.ProductID]: true }));
    }, []);

    const save = React.useCallback((dataItem: Product) => {
        setEditDescriptor(prevEdit => {
            const newEdit = { ...prevEdit };
            delete newEdit[dataItem.ProductID];
            return newEdit;
        });
    }, []);

    const cancel = React.useCallback((dataItem: Product) => {
        setEditDescriptor(prevEdit => {
            const newEdit = { ...prevEdit };
            delete newEdit[dataItem.ProductID];
            return newEdit;
        });

        const originalItem = initialData.find(p => p.ProductID === dataItem.ProductID);
        setData(prevData => {
            if (originalItem) {
                return prevData.map(item => item.ProductID === dataItem.ProductID ? { ...originalItem } : item);
            } else {
                return prevData.filter(item => item.ProductID !== dataItem.ProductID);
            }
        });
    }, []);

    const remove = React.useCallback((dataItem: Product) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            setData(prevData => prevData.filter(item => item.ProductID !== dataItem.ProductID));
        }
    }, []);

    return (
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
                    Product Management
                </h1>
            </div>

            {/*The 'Grid' is the core enterprise component, handling virtualization and state management. */}
            <Grid
                style={{ 
                    height: '550px', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                data={data}
                onItemChange={onItemChange}
                onEditChange={onEditChange}
                edit={editDescriptor}
                editable={true}
                dataItemKey="ProductID"
                adaptive={true}
                navigatable={true}
            >
                <GridToolbar>
                    <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Themed button system with integrated SVG support. */}
                        <Button
                            themeColor="primary"
                            svgIcon={plusIcon}
                            onClick={addNew}
                            style={{ borderRadius: '8px', fontWeight: 600 }}
                        >
                            Add New Product
                        </Button>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                            Total Records: {data.length}
                        </span>
                    </div>
                </GridToolbar>
                
                {/* Declarative column definitions with built-in validation and editors. */}
                <Column field="ProductID" title="ID" width="80px" editable={false} />
                <Column field="ProductName" title="Product Name" />
                <Column field="UnitPrice" title="Unit Price" width="180px" editor="numeric" format="{0:C2}" />
                <Column field="UnitsInStock" title="In Stock" width="140px" editor="numeric" />
                <Column field="Discontinued" title="Status" width="120px" editor="boolean" />

                <Column
                    title="Actions"
                    width="150px"
                    cells={{
                        data: (props: GridCellProps) => {
                            const inEdit = editDescriptor[props.dataItem.ProductID];
                            return (
                                <td style={{ textAlign: 'center' }}>
                                    {!inEdit ? (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <Button
                                                svgIcon={pencilIcon}
                                                onClick={() => enterEdit(props.dataItem)}
                                                fillMode="flat"
                                                themeColor="info"
                                                title="Edit"
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
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <Button
                                                svgIcon={saveIcon}
                                                onClick={() => save(props.dataItem)}
                                                fillMode="solid"
                                                themeColor="success"
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
                            );
                        }
                    }}
                />
            </Grid>
        </div>
    );
};

export default ProductManagement;
