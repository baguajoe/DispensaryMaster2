import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { Link } from "react-router-dom";

const Wishlist = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        actions.fetchWishlist().then(() => setLoading(false));
    }, []);

    const wishlist = store.wishlist || [];

    const handleRemove = async (itemId) => {
        try {
            await fetch(`${process.env.BACKEND_URL}/api/wishlist/${itemId}`, {
                method:"DELETE",
                headers: { Authorization:`Bearer ${token}` }
            });
            await actions.fetchWishlist();
        } catch(e) { console.error(e); }
    };

    const handleMoveToCart = async (item) => {
        await actions.addToCart(item.product_id || item.id, 1);
        await handleRemove(item.id);
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4">
                <h2>❤️ Wishlist</h2>
                <p>{wishlist.length} saved items</p>
            </div>

            {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-light" /></div>
            ) : wishlist.length === 0 ? (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>❤️</div>
                    <h5>Your wishlist is empty</h5>
                    <p>Save products you love to buy later</p>
                    <Link to="/shop" className="btn btn-success mt-2">Browse Products</Link>
                </div>
            ) : (
                <div className="row g-3">
                    {wishlist.map((item, i) => (
                        <div key={i} className="col-md-4 col-lg-3">
                            <div className="glass-panel h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="badge bg-secondary">{item.category||"Product"}</span>
                                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleRemove(item.id)}>✕</button>
                                </div>
                                <h6 className="fw-bold mb-1">{item.name||item.product_name||"Product"}</h6>
                                {item.strain && <p style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",margin:"0 0 0.5rem"}}>{item.strain}</p>}
                                <div className="mt-auto">
                                    <div className="text-success fw-bold mb-2">${parseFloat(item.price||item.unit_price||0).toFixed(2)}</div>
                                    <button className="btn btn-success btn-sm w-100" onClick={() => handleMoveToCart(item)}>
                                        🛒 Add to Cart
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
export default Wishlist;
