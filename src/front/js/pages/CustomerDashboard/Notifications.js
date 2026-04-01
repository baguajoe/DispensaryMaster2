import React, { useState, useEffect } from "react";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/customer/notifications`, {
            headers: { Authorization:`Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setNotifications(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const TYPE_ICONS = { order:"📦", promotion:"🏷️", loyalty:"🏆", system:"🔔" };
    const TYPE_COLORS = { order:"info", promotion:"warning", loyalty:"success", system:"secondary" };
    const unread = notifications.filter(n => !n.read).length;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2 style={{ color: "#ffab00", fontWeight: 800 }}>🔔 Notifications</h2>
                    <p>{unread} unread notification{unread !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
            : notifications.length === 0 ? (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>🔔</div>
                    <h5>No notifications</h5>
                    <p>You're all caught up!</p>
                </div>
            ) : (
                <div className="glass-panel">
                    {notifications.map((n,i) => (
                        <div key={i} className="d-flex align-items-start gap-3 p-3 mb-2 rounded"
                            style={{background:n.read?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.1)"}}>
                            <div style={{fontSize:"1.5rem"}}>{TYPE_ICONS[n.type]||"🔔"}</div>
                            <div className="flex-grow-1">
                                <div style={{fontWeight:n.read?400:600}}>{n.message}</div>
                                {n.date && <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)",marginTop:"0.25rem"}}>
                                    {new Date(n.date).toLocaleDateString()}
                                </div>}
                            </div>
                            <span className={`badge bg-${TYPE_COLORS[n.type]||"secondary"} ${n.type==="promotion"?"text-dark":""}`}>{n.type}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Notifications;
