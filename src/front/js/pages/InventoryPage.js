import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InventoryPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [filter, setFilter] = useState("all");
    const [updating, setUpdating] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/products`, { headers }).then(r => r.ok ? r.json() : {}),
            fetch(`${process.env.BACKEND_URL}/api/inventory/analytics`, { headers }).then(r => r.ok ? r.json() : {}),
        ]).then(([prods, ana]) => {
            const list = Array.isArray(prods) ? prods : (prods.products || []);
            setProducts(list);
            setAnalytics(ana);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleUpdateStock = async (productId, newStock) => {
        setUpdating(productId);
        try {
            await fetch(`${process.env.BACKEND_URL}/api/update-stock/${productId}`, {
                method:"POST", headers, body:JSON.stringify({ current_stock: parseInt(newStock) })
            });
            load();
        } catch(e) { console.error(e); }
        finally { setUpdating(null); }
    };

    const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

    const filtered = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.batch_number?.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === "All" || p.category === category;
        const matchFilter = filter === "all" ? true :
            filter === "low" ? p.current_stock <= (p.reorder_point || 10) && p.current_stock > 0 :
            filter === "out" ? p.current_stock <= 0 : true;
        return matchSearch && matchCat && matchFilter;
    });

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📦 Inventory Management</h2><p>{products.length} products tracked</p></div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-warning" onClick={()=>navigate("/stock-alerts")}>⚠️ Alerts</button>
                    <button className="btn btn-success" onClick={()=>navigate("/products")}>+ Add Product</button>
                </div>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    {l:"Total Products", v:products.length, c:"#11cdef"},
                    {l:"Total Units", v:products.reduce((s,p)=>s+(p.current_stock||0),0), c:"#2dce89"},
                    {l:"Low Stock", v:products.filter(p=>p.current_stock>0&&p.current_stock<=(p.reorder_point||10)).length, c:"#ffd600"},
                    {l:"Out of Stock", v:products.filter(p=>p.current_stock<=0).length, c:"#f5365c"},
                    {l:"Total Value", v:`$${products.reduce((s,p)=>s+(p.current_stock||0)*(parseFloat(p.unit_price)||0),0).toFixed(0)}`, c:"#2dce89"},
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                            <div style={{fontSize:"1.3rem",fontWeight:700,color:s.c,marginTop:"4px"}}>{s.v}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-panel mb-3">
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                        <input className="form-control" placeholder="Search by name or batch number..." value={search} onChange={e=>setSearch(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={category} onChange={e=>setCategory(e.target.value)}>
                            {categories.map(c=><option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="col-md-5 d-flex gap-2">
                        {[{v:"all",l:"All"},{v:"low",l:"⚠️ Low Stock"},{v:"out",l:"🚫 Out of Stock"}].map(f=>(
                            <button key={f.v} className={`btn btn-sm ${filter===f.v?"btn-success":"btn-outline-light"}`} onClick={()=>setFilter(f.v)}>{f.l}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="glass-panel">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                            <th>Product</th><th>Category</th><th>Batch #</th><th>THC</th><th>Current Stock</th><th>Reorder Point</th><th>Unit Price</th><th>Value</th><th>Update Stock</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(p => {
                                const isLow = p.current_stock <= (p.reorder_point||10) && p.current_stock > 0;
                                const isOut = p.current_stock <= 0;
                                const stockColor = isOut ? "#f5365c" : isLow ? "#ffd600" : "#2dce89";
                                return (
                                    <tr key={p.id}>
                                        <td style={{fontWeight:600}}>{p.name}</td>
                                        <td><span className="badge bg-secondary">{p.category}</span></td>
                                        <td style={{fontFamily:"monospace",fontSize:"0.8rem",color:"rgba(255,255,255,0.6)"}}>{p.batch_number||"—"}</td>
                                        <td style={{fontSize:"0.85rem"}}>{p.thc_content ? `${p.thc_content}%` : "—"}</td>
                                        <td>
                                            <span style={{fontWeight:700,color:stockColor}}>
                                                {p.current_stock}
                                                {isOut && " 🚫"}
                                                {isLow && " ⚠️"}
                                            </span>
                                        </td>
                                        <td style={{color:"rgba(255,255,255,0.5)"}}>{p.reorder_point||10}</td>
                                        <td style={{color:"#2dce89"}}>${parseFloat(p.unit_price||0).toFixed(2)}</td>
                                        <td style={{color:"#11cdef"}}>${((p.current_stock||0)*parseFloat(p.unit_price||0)).toFixed(2)}</td>
                                        <td>
                                            <div className="d-flex gap-1 align-items-center">
                                                <input type="number" className="form-control form-control-sm" style={{width:"70px"}}
                                                    defaultValue={p.current_stock} min="0"
                                                    onBlur={e => {
                                                        if (parseInt(e.target.value) !== p.current_stock) {
                                                            handleUpdateStock(p.id, e.target.value);
                                                        }
                                                    }}
                                                />
                                                {updating === p.id && <span className="spinner-border spinner-border-sm text-light"/>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No products found</div>}
            </div>
        </div>
    );
};
export default InventoryPage;
