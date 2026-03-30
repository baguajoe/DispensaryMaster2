import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DashboardOverview = () => {
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/customer/profile`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/customer/orders`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/wishlist`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([p, o, w]) => {
            setProfile(p);
            setOrders(Array.isArray(o) ? o : []);
            setWishlist(Array.isArray(w) ? w : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    const TIER_COLORS = { gold:"#ffd600", premium:"#11cdef", standard:"#2dce89" };
    const TIER_ICONS = { gold:"👑", premium:"⭐", standard:"🌿" };
    const tier = profile?.membership_level || "standard";

    return (
        <div className="main-content p-4">
            {/* Welcome Banner */}
            <div className="glass-panel mb-4 p-4" style={{background:"linear-gradient(135deg, rgba(45,206,137,0.15), rgba(17,205,239,0.15))", borderColor:"rgba(45,206,137,0.3)"}}>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="text-white mb-1">
                            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}! {TIER_ICONS[tier]}
                        </h3>
                        <p style={{color:"rgba(255,255,255,0.6)", margin:0}}>
                            {profile?.email} · <span style={{color:TIER_COLORS[tier], textTransform:"capitalize"}}>{tier} Member</span>
                        </p>
                    </div>
                    <div className="text-center">
                        <div style={{fontSize:"2.5rem",fontWeight:700,color:TIER_COLORS[tier]}}>{profile?.loyalty_points||0}</div>
                        <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>Loyalty Points</div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Total Orders", value:orders.length, icon:"📦", color:"#11cdef", to:"/customer/orders" },
                    { label:"Total Spent", value:`$${(profile?.total_spent||0).toFixed(2)}`, icon:"💰", color:"#2dce89", to:"/customer/orders" },
                    { label:"Wishlist Items", value:wishlist.length, icon:"❤️", color:"#f5365c", to:"/customer/wishlist" },
                    { label:"Loyalty Points", value:profile?.loyalty_points||0, icon:"🏆", color:TIER_COLORS[tier], to:"/customer/loyalty-program" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <Link to={s.to} style={{textDecoration:"none"}}>
                            <div className="glass-panel text-center" style={{cursor:"pointer",transition:"transform 0.2s"}}
                                onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                                onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                                <div style={{fontSize:"1.8rem"}}>{s.icon}</div>
                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",margin:"0.5rem 0 0.25rem"}}>{s.label}</div>
                                <div style={{fontSize:"1.5rem",fontWeight:700,color:s.color}}>{s.value}</div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {/* Recent Orders */}
                <div className="col-md-7">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Recent Orders</h5>
                            <Link to="/customer/orders" className="btn btn-sm btn-outline-light">View All</Link>
                        </div>
                        {orders.slice(0,4).map(o => (
                            <div key={o.id} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                                style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                                <div>
                                    <div style={{fontWeight:600,fontSize:"0.9rem"}}>Order #{o.id}</div>
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
                                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : ""}
                                        {o.items?.length > 0 ? ` · ${o.items.length} item${o.items.length>1?"s":""}` : ""}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-success">${parseFloat(o.total_amount||0).toFixed(2)}</span>
                                    <span className={`badge bg-${o.status==="completed"?"success":o.status==="pending"?"warning":"secondary"}`}>{o.status}</span>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="text-center py-3" style={{color:"rgba(255,255,255,0.5)"}}>
                                <p>No orders yet</p>
                                <Link to="/shop" className="btn btn-success btn-sm">Browse Products</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions + Loyalty */}
                <div className="col-md-5">
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Quick Actions</h5>
                        <div className="d-flex flex-column gap-2">
                            <Link to="/shop" className="btn btn-success btn-sm">🌿 Shop Now</Link>
                            <Link to="/customer/orders" className="btn btn-outline-light btn-sm">📦 Track Orders</Link>
                            <Link to="/customer/wishlist" className="btn btn-outline-light btn-sm">❤️ View Wishlist</Link>
                            <Link to="/customer/loyalty-program" className="btn btn-outline-light btn-sm">🏆 Redeem Points</Link>
                            <Link to="/customer/profile" className="btn btn-outline-light btn-sm">👤 Edit Profile</Link>
                        </div>
                    </div>

                    {/* Loyalty Tier */}
                    <div className="glass-panel" style={{borderColor:`${TIER_COLORS[tier]}44`}}>
                        <h6 style={{color:TIER_COLORS[tier]}}>{TIER_ICONS[tier]} {tier.toUpperCase()} MEMBER</h6>
                        <div className="mb-2">
                            <div className="d-flex justify-content-between" style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)"}}>
                                <span>Points to next tier</span>
                                <span style={{color:TIER_COLORS[tier]}}>{profile?.loyalty_points||0} pts</span>
                            </div>
                            <div className="progress mt-1" style={{height:"6px",background:"rgba(255,255,255,0.1)"}}>
                                <div className="progress-bar" style={{width:`${Math.min(100,(profile?.loyalty_points||0)/10)}%`,background:TIER_COLORS[tier]}} />
                            </div>
                        </div>
                        <Link to="/customer/loyalty-program" style={{fontSize:"0.8rem",color:TIER_COLORS[tier]}}>View rewards →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DashboardOverview;
