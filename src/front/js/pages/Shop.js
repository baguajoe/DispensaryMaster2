import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All","Flower","Edibles","Concentrates","Vapes","Tinctures","Pre-Rolls","Accessories"];

const Shop = () => {
    const { store, actions } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");
    const [loading, setLoading] = useState(true);
    const [cartMsg, setCartMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/products`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const available = Array.isArray(data) ? data.filter(p => (p.stock || p.current_stock || 0) > 0) : [];
                setProducts(available);
                setFiltered(available);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...products];
        if (category !== "All") result = result.filter(p => p.category === category);
        if (search) result = result.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.strain?.toLowerCase().includes(search.toLowerCase()));
        result.sort((a, b) => {
            if (sort === "price_asc") return (a.price || 0) - (b.price || 0);
            if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
            if (sort === "thc") return (b.thc_content || 0) - (a.thc_content || 0);
            return a.name?.localeCompare(b.name);
        });
        setFiltered(result);
    }, [products, category, search, sort]);

    const addToCart = async (product) => {
        const result = await actions.addToCart(product.id, 1);
        if (result?.success) {
            setCartMsg(`${product.name} added to cart`);
            setTimeout(() => setCartMsg(""), 2000);
        }
    };

    const getPrice = (p) => parseFloat(p.price || p.unit_price || 0);
    const getStock = (p) => p.stock || p.current_stock || 0;

    return (
        <div className="main-content p-4">
            {cartMsg && (
                <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-2" style={{zIndex:9999}}>
                    🛒 {cartMsg}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>🌿 Shop</h2>
                    <p>{filtered.length} products available</p>
                </div>
                <button className="btn btn-outline-success" onClick={() => navigate("/cart-management")}>
                    🛒 Cart ({(store.cartItems || []).length})
                </button>
            </div>

            {/* Filters */}
            <div className="glass-panel mb-4">
                <div className="row g-2 align-items-center">
                    <div className="col-md-4">
                        <input className="form-control" placeholder="Search products, strains..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", flexWrap: "nowrap", paddingBottom: "2px" }}>
                            {CATEGORIES.map(c => (
                                <button key={c} className={`btn btn-sm ${category===c?"btn-success":"btn-outline-success"}`}
                                    onClick={() => setCategory(c)}>{c}</button>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="name">Sort: Name</option>
                            <option value="price_asc">Sort: Price Low-High</option>
                            <option value="price_desc">Sort: Price High-Low</option>
                            <option value="thc">Sort: THC %</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-light" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>🌿</div>
                    <h5>No products found</h5>
                </div>
            ) : (
                <div className="row g-3">
                    {filtered.map(p => (
                        <div key={p.id} className="col-6 col-md-4 col-lg-3">
                            <div className="glass-panel h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className={`badge ${p.strain==="Sativa"?"bg-warning text-dark":p.strain==="Indica"?"bg-primary":"bg-success"}`}>
                                        {p.strain || p.category}
                                    </span>
                                    <span className="badge bg-secondary">{p.category}</span>
                                </div>
                                <h6 className="fw-bold mb-1">{p.name}</h6>
                                {p.thc_content > 0 && (
                                    <p style={{fontSize:"0.75rem", color:"rgba(255,255,255,0.55)", margin:"0 0 0.5rem"}}>
                                        THC: {p.thc_content}% {p.cbd_content > 0 ? `· CBD: ${p.cbd_content}%` : ""}
                                    </p>
                                )}
                                <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                                    <span className="text-success fw-bold">${getPrice(p).toFixed(2)}</span>
                                    <span className={`badge ${getStock(p) < 10 ? "bg-danger" : "bg-light text-dark"}`}>
                                        {getStock(p)} left
                                    </span>
                                </div>
                                <button className="btn btn-success btn-sm w-100 mt-2" onClick={() => addToCart(p)}>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Shop;
