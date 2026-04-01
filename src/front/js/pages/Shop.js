import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const DEFAULT_CATEGORIES = [
    "All","Flower","Edibles","Concentrates","Vapes","Tinctures",
    "Pre-Rolls","Accessories","Topicals","Capsules","Beverages",
    "Sublingual","Seeds","Clones","Shake","Kief","Hash",
    "CBD Products","High-CBD","Sativa","Indica","Hybrid",
    "Infused","Patches","Suppositories"
];


const CATEGORY_IMAGES = {
    "Flower": "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?w=400&q=80",
    "Edibles": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80",
    "Concentrates": "https://images.unsplash.com/photo-1604506007998-0dc565cd7b47?w=400&q=80",
    "Vapes": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80",
    "Tinctures": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
    "Pre-Rolls": "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?w=400&q=80",
    "Accessories": "https://images.unsplash.com/photo-1603478638054-63ea0c99b82e?w=400&q=80",
    "Topicals": "https://images.unsplash.com/photo-1612197795006-9f3e9e76e35f?w=400&q=80",
    "CBD Products": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
    "Capsules": "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
    "Beverages": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
    "default": "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?w=400&q=80"
};

const Shop = () => {
    const { store, actions } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState("All");
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [showCatManager, setShowCatManager] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");
    const [loading, setLoading] = useState(true);
    const [cartMsg, setCartMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/shop/products`)
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
                {/* Row 1: Search + Sort */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", alignItems: "center" }}>
                    <input className="form-control" placeholder="Search products, strains..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ maxWidth: 320 }} />
                    <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}
                        style={{ maxWidth: 180 }}>
                        <option value="name">Sort: Name</option>
                            <option value="price_asc">Sort: Price Low-High</option>
                            <option value="price_desc">Sort: Price High-Low</option>
                            <option value="thc">Sort: THC %</option>
                    </select>
                </div>
                {/* Row 2: Category tabs — full width */}
                <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", flexWrap: "nowrap", paddingBottom: "4px" }}>
                    {(categories.length > 1 ? categories : DEFAULT_CATEGORIES).map(c => (
                        <button key={c}
                            onClick={() => setCategory(c)}
                            style={{
                                background: category === c ? "#ffab00" : "transparent",
                                color: category === c ? "#0a0800" : "rgba(255,248,225,0.6)",
                                border: `1px solid ${category === c ? "#ffab00" : "rgba(255,171,0,0.25)"}`,
                                padding: "0.3rem 0.85rem",
                                borderRadius: 100,
                                fontSize: "0.78rem",
                                fontWeight: category === c ? 700 : 400,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                transition: "all 0.15s",
                                flexShrink: 0,
                            }}>
                            {c}
                        </button>
                    ))}
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
                            <div className="glass-panel h-100 d-flex flex-column" style={{ padding: 0, overflow: "hidden" }}>
                                <div style={{ height: 160, position: "relative", flexShrink: 0 }}>
                                    <img
                                        src={CATEGORY_IMAGES[p.category] || CATEGORY_IMAGES.default}
                                        alt={p.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        onError={e => { e.target.src = CATEGORY_IMAGES.default; }}
                                    />
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(10,8,0,0.85) 100%)" }} />
                                    <span style={{ position: "absolute", bottom: 8, left: 10, color: "#ffab00", fontWeight: 800, fontSize: "0.9rem", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{p.name}</span>
                                </div>
                                <div style={{ padding: "0.75rem" }} className="d-flex flex-column flex-grow-1">
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Shop;
