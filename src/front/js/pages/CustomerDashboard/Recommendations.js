import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { Link } from "react-router-dom";

const Recommendations = () => {
    const { actions } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartMsg, setCartMsg] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/customer/recommendations`, {
            headers: { Authorization:`Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setProducts(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const addToCart = async (product) => {
        const result = await actions.addToCart(product.id, 1);
        if (result?.success) {
            setCartMsg(`${product.name} added to cart!`);
            setTimeout(() => setCartMsg(""), 2000);
        }
    };

    const addToWishlist = async (productId) => {
        await actions.addToWishlist(productId);
        setCartMsg("Added to wishlist!");
        setTimeout(() => setCartMsg(""), 2000);
    };

    const getPrice = (p) => parseFloat(p.price||p.unit_price||0);
    const getStock = (p) => p.stock||p.current_stock||0;

    return (
        <div className="main-content p-4">
            {cartMsg && (
                <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-2" style={{zIndex:9999}}>
                    ✅ {cartMsg}
                </div>
            )}
            <div className="page-header mb-4">
                <h2>✨ Recommended for You</h2>
                <p>Products selected based on your purchase history and preferences</p>
            </div>

            {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-light" /></div>
            ) : products.length === 0 ? (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>✨</div>
                    <h5>No recommendations yet</h5>
                    <p>Make a purchase to get personalized recommendations</p>
                    <Link to="/shop" className="btn btn-success mt-2">Browse All Products</Link>
                </div>
            ) : (
                <div className="row g-3">
                    {products.map(p => (
                        <div key={p.id} className="col-6 col-md-4 col-lg-3">
                            <div className="glass-panel h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className={`badge ${p.strain==="Sativa"?"bg-warning text-dark":p.strain==="Indica"?"bg-primary":"bg-success"}`}>
                                        {p.strain||p.category}
                                    </span>
                                    <button className="btn btn-sm btn-link p-0" style={{color:"rgba(255,255,255,0.4)"}}
                                        title="Save to wishlist" onClick={() => addToWishlist(p.id)}>❤️</button>
                                </div>
                                <h6 className="fw-bold mb-1">{p.name}</h6>
                                {p.thc_content > 0 && (
                                    <p style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",margin:"0 0 0.5rem"}}>
                                        THC: {p.thc_content}%{p.cbd_content > 0 ? ` · CBD: ${p.cbd_content}%` : ""}
                                    </p>
                                )}
                                <div className="d-flex justify-content-between align-items-center mt-auto pt-2 mb-2">
                                    <span className="text-success fw-bold">${getPrice(p).toFixed(2)}</span>
                                    <span className={`badge ${getStock(p) < 5 ? "bg-warning text-dark" : "bg-light text-dark"}`}>{getStock(p)} left</span>
                                </div>
                                <button className="btn btn-success btn-sm w-100" onClick={() => addToCart(p)} disabled={getStock(p) === 0}>
                                    {getStock(p) === 0 ? "Out of Stock" : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Recommendations;
