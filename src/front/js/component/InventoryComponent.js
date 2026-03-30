import React, { useEffect, useState } from "react";

const InventoryComponent = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState({});

    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products`, { headers });
            const data = await r.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStock = async (product, delta) => {
        const newStock = Math.max(0, product.stock + delta);
        setUpdating(prev => ({ ...prev, [product.id]: true }));
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products/${product.id}`, {
                method: "PUT", headers,
                body: JSON.stringify({ ...product, current_stock: newStock })
            });
            if (r.ok) {
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, current_stock: newStock } : p));
            }
        } catch (e) { console.error(e); }
        finally { setUpdating(prev => ({ ...prev, [product.id]: false })); }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batch_number?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="text-center py-4"><div className="spinner-border text-success" /></div>;

    return (
        <div>
            <input className="form-control mb-3" placeholder="Search products..."
                value={search} onChange={e => setSearch(e.target.value)} />
            <div className="row g-3">
                {filtered.map(item => (
                    <div key={item.id} className="col-md-4">
                        <div className={`card ${item.stock <= item.reorder_point ? "border-danger" : ""}`}>
                            <div className="card-body">
                                <h6 className="card-title">{item.name}</h6>
                                <p className="small text-muted mb-1">{item.category} {item.strain && `· ${item.strain}`}</p>
                                <p className="small mb-1">Batch: <code>{item.batch_number}</code></p>
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    <button className="btn btn-sm btn-outline-danger"
                                        onClick={() => updateStock(item, -1)}
                                        disabled={updating[item.id]}>-</button>
                                    <span className={`badge ${item.stock === 0 ? "bg-danger" : item.stock <= item.reorder_point ? "bg-warning text-dark" : "bg-success"}`}>
                                        {item.stock} units
                                    </span>
                                    <button className="btn btn-sm btn-outline-success"
                                        onClick={() => updateStock(item, 1)}
                                        disabled={updating[item.id]}>+</button>
                                </div>
                                {item.stock <= item.reorder_point && (
                                    <small className="text-danger d-block mt-1">⚠️ Below reorder point ({item.reorder_point})</small>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-muted text-center py-3">No inventory items found</p>}
            </div>
        </div>
    );
};

export default InventoryComponent;
