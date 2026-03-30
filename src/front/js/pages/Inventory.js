import React, { useState, useEffect } from "react";

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [stockInputs, setStockInputs] = useState({});

    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => { fetchInventory(); }, []);

    useEffect(() => {
        let result = [...products];
        if (filter === "low") result = result.filter(p => p.stock <= p.reorder_point);
        else if (filter === "out") result = result.filter(p => p.stock === 0);
        else if (filter === "ok") result = result.filter(p => p.stock > p.reorder_point);
        if (search) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
    }, [products, search, filter]);

    const fetchInventory = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products`, { headers });
            const data = await r.json();
            setProducts(Array.isArray(data) ? data : []);
            const inputs = {};
            if (Array.isArray(data)) data.forEach(p => { inputs[p.id] = p.stock; });
            setStockInputs(inputs);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStock = async (productId) => {
        const newStock = parseInt(stockInputs[productId]);
        if (isNaN(newStock) || newStock < 0) return alert("Invalid stock value");
        setUpdating(prev => ({ ...prev, [productId]: true }));
        try {
            const product = products.find(p => p.id === productId);
            const r = await fetch(`${process.env.BACKEND_URL}/api/products/${productId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ ...product, current_stock: newStock })
            });
            if (r.ok) {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, current_stock: newStock } : p));
            }
        } catch (e) { console.error(e); }
        finally { setUpdating(prev => ({ ...prev, [productId]: false })); }
    };

    const getStockStatus = (product) => {
        if (product.stock === 0) return { label: "Out of Stock", color: "danger" };
        if (product.stock <= product.reorder_point) return { label: "Low Stock", color: "warning" };
        return { label: "In Stock", color: "success" };
    };

    const stats = {
        total: products.length,
        low: products.filter(p => p.stock <= p.reorder_point && p.stock > 0).length,
        out: products.filter(p => p.stock === 0).length,
        value: products.reduce((sum, p) => sum + (p.stock * p.price), 0).toFixed(2)
    };

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-success" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Inventory Management</h1>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total SKUs", value: stats.total, color: "primary" },
                    { label: "Low Stock", value: stats.low, color: "warning" },
                    { label: "Out of Stock", value: stats.out, color: "danger" },
                    { label: "Total Value", value: `$${parseFloat(stats.value).toLocaleString()}`, color: "success" },
                ].map((s, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className={`card border-${s.color} border-start border-3`}>
                            <div className="card-body py-3">
                                <p className="text-muted small mb-1">{s.label}</p>
                                <h4 className={`mb-0 text-${s.color}`}>{s.value}</h4>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="row g-2 mb-3">
                <div className="col-md-5">
                    <input className="form-control" placeholder="Search by name, batch, category..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <div className="btn-group w-100">
                        {["all", "low", "out", "ok"].map(f => (
                            <button key={f} className={`btn btn-sm ${filter === f ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => setFilter(f)}>
                                {f === "all" ? "All" : f === "low" ? "Low Stock" : f === "out" ? "Out of Stock" : "In Stock"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Batch #</th>
                                <th>THC/CBD</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Update Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(product => {
                                const status = getStockStatus(product);
                                return (
                                    <tr key={product.id}>
                                        <td><strong>{product.name}</strong></td>
                                        <td>{product.category}</td>
                                        <td><code>{product.batch_number}</code></td>
                                        <td>
                                            {product.thc_content > 0 && <span className="badge bg-warning text-dark me-1">THC {product.thc_content}%</span>}
                                            {product.cbd_content > 0 && <span className="badge bg-info me-1">CBD {product.cbd_content}%</span>}
                                        </td>
                                        <td>${parseFloat(product.price).toFixed(2)}</td>
                                        <td><span className={`badge bg-${status.color}`}>{status.label} ({product.stock})</span></td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
                                                    value={stockInputs[product.id] ?? product.stock}
                                                    min="0"
                                                    onChange={e => setStockInputs(prev => ({ ...prev, [product.id]: e.target.value }))} />
                                                <button className="btn btn-sm btn-success"
                                                    onClick={() => updateStock(product.id)}
                                                    disabled={updating[product.id]}>
                                                    {updating[product.id] ? "..." : "Save"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">No inventory items found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
