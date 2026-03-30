import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StockAlerts = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState({ low_stock:[], out_of_stock:[] });
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/stock`, { headers }).then(r => r.ok ? r.json() : {}),
            fetch(`${process.env.BACKEND_URL}/api/products`, { headers }).then(r => r.ok ? r.json() : {}),
        ]).then(([stockData, productsData]) => {
            const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
            const outOfStock = products.filter(p => p.current_stock <= 0);
            const lowStock = products.filter(p => p.current_stock > 0 && p.current_stock <= (p.reorder_point || 10));
            setAlerts({ low_stock: lowStock, out_of_stock: outOfStock });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleReorder = async (product) => {
        setReordering(product.id);
        try {
            await fetch(`${process.env.BACKEND_URL}/api/orders`, {
                method:"POST", headers,
                body: JSON.stringify({ supplier_id: product.supplier_id || 1, items: [{ product_id: product.id, quantity: product.reorder_point * 2 || 20 }] })
            });
            alert(`Reorder placed for ${product.name}`);
        } catch(e) { console.error(e); }
        finally { setReordering(null); }
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    const total = alerts.low_stock.length + alerts.out_of_stock.length;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>⚠️ Stock Alerts</h2><p>{total} products need attention</p></div>

            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3"><div className="glass-panel text-center"><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>Out of Stock</div><div style={{fontSize:"2rem",fontWeight:700,color:"#f5365c"}}>{alerts.out_of_stock.length}</div></div></div>
                <div className="col-6 col-md-3"><div className="glass-panel text-center"><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>Low Stock</div><div style={{fontSize:"2rem",fontWeight:700,color:"#ffd600"}}>{alerts.low_stock.length}</div></div></div>
            </div>

            {alerts.out_of_stock.length > 0 && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3" style={{color:"#f5365c"}}>🚫 Out of Stock</h5>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem"}}><th>Product</th><th>Category</th><th>Reorder Point</th><th>Actions</th></tr></thead>
                            <tbody>
                                {alerts.out_of_stock.map(p => (
                                    <tr key={p.id}>
                                        <td style={{fontWeight:600}}>{p.name}</td>
                                        <td><span className="badge bg-secondary">{p.category}</span></td>
                                        <td>{p.reorder_point || 10} units</td>
                                        <td className="d-flex gap-2">
                                            <button className="btn btn-danger btn-sm" disabled={reordering===p.id} onClick={()=>handleReorder(p)}>{reordering===p.id?<span className="spinner-border spinner-border-sm"/>:"🔄 Reorder"}</button>
                                            <button className="btn btn-outline-light btn-sm" onClick={()=>navigate("/products")}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {alerts.low_stock.length > 0 && (
                <div className="glass-panel">
                    <h5 className="mb-3" style={{color:"#ffd600"}}>⚠️ Low Stock</h5>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem"}}><th>Product</th><th>Category</th><th>Current Stock</th><th>Reorder Point</th><th>Actions</th></tr></thead>
                            <tbody>
                                {alerts.low_stock.map(p => (
                                    <tr key={p.id}>
                                        <td style={{fontWeight:600}}>{p.name}</td>
                                        <td><span className="badge bg-secondary">{p.category}</span></td>
                                        <td><span style={{color:"#ffd600",fontWeight:700}}>{p.current_stock}</span></td>
                                        <td>{p.reorder_point || 10}</td>
                                        <td className="d-flex gap-2">
                                            <button className="btn btn-warning btn-sm text-dark" disabled={reordering===p.id} onClick={()=>handleReorder(p)}>{reordering===p.id?<span className="spinner-border spinner-border-sm"/>:"🔄 Reorder"}</button>
                                            <button className="btn btn-outline-light btn-sm" onClick={()=>navigate("/products")}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {total === 0 && (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>✅</div>
                    <h5>All products are well stocked!</h5>
                </div>
            )}
        </div>
    );
};
export default StockAlerts;
