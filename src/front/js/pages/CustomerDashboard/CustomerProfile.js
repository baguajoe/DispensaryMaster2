import React, { useState, useEffect } from "react";

const CustomerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/customer/profile`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => { setProfile(data); setForm(data||{}); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/customer/profile`, {
                method:"PUT", headers, body: JSON.stringify({ first_name:form.first_name, last_name:form.last_name, phone:form.phone })
            });
            if (r.ok) { setProfile({...profile,...form}); setEditing(false); }
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    const TIER_COLORS = { gold:"#ffd600", premium:"#11cdef", standard:"#2dce89" };
    const tier = profile?.membership_level || "standard";
    const initials = `${profile?.first_name?.[0]||""}${profile?.last_name?.[0]||""}`.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "?";

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>👤 My Profile</h2><p>Manage your account information</p></div>
            <div className="row g-4">
                {/* Profile Card */}
                <div className="col-md-4">
                    <div className="glass-panel text-center">
                        <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                            style={{width:"80px",height:"80px",background:`${TIER_COLORS[tier]}33`,border:`2px solid ${TIER_COLORS[tier]}`,fontSize:"1.8rem",fontWeight:700,color:TIER_COLORS[tier]}}>
                            {initials}
                        </div>
                        <h5 style={{ color: "#ffab00", fontWeight: 900 }}>{profile?.first_name ? `${profile.first_name} ${profile.last_name}` : profile?.email}</h5>
                        <p style={{color:TIER_COLORS[tier],textTransform:"capitalize",margin:"0 0 0.5rem"}}>{tier} Member</p>
                        <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem",margin:0}}>{profile?.email}</p>
                        <hr style={{borderColor:"rgba(255,255,255,0.1)"}} />
                        <div className="row g-2">
                            <div className="col-6">
                                <div style={{fontSize:"1.3rem",fontWeight:700,color:"#2dce89"}}>{profile?.total_orders||0}</div>
                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Orders</div>
                            </div>
                            <div className="col-6">
                                <div style={{fontSize:"1.3rem",fontWeight:700,color:"#ffd600"}}>{profile?.loyalty_points||0}</div>
                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Points</div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className={`badge ${profile?.verification_status==="verified"?"bg-success":"bg-warning text-dark"}`}>
                                {profile?.verification_status==="verified" ? "✓ Verified" : "Pending Verification"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Profile */}
                <div className="col-md-8">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">Account Information</h5>
                            {!editing
                                ? <button className="btn btn-outline-light btn-sm" onClick={() => setEditing(true)}>Edit</button>
                                : <div className="d-flex gap-2">
                                    <button className="btn btn-outline-light btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                                    <button className="btn btn-success btn-sm" onClick={handleSave} disabled={saving}>
                                        {saving ? <span className="spinner-border spinner-border-sm" /> : "Save"}
                                    </button>
                                </div>
                            }
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.6)"}}>First Name</label>
                                {editing
                                    ? <input className="form-control" value={form.first_name||""} onChange={e => setForm({...form,first_name:e.target.value})} />
                                    : <div className="fw-semibold">{profile?.first_name||"—"}</div>
                                }
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.6)"}}>Last Name</label>
                                {editing
                                    ? <input className="form-control" value={form.last_name||""} onChange={e => setForm({...form,last_name:e.target.value})} />
                                    : <div className="fw-semibold">{profile?.last_name||"—"}</div>
                                }
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.6)"}}>Email</label>
                                <div className="fw-semibold">{profile?.email||"—"}</div>
                                <small style={{color:"rgba(255,255,255,0.4)"}}>Contact support to change email</small>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.6)"}}>Phone</label>
                                {editing
                                    ? <input className="form-control" value={form.phone||""} onChange={e => setForm({...form,phone:e.target.value})} />
                                    : <div className="fw-semibold">{profile?.phone||"—"}</div>
                                }
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.6)"}}>Membership Level</label>
                                <div><span className="badge text-capitalize" style={{background:TIER_COLORS[tier]+"33",color:TIER_COLORS[tier],border:`1px solid ${TIER_COLORS[tier]}55`}}>{tier}</span></div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.6)"}}>Total Spent</label>
                                <div className="fw-semibold text-success">${(profile?.total_spent||0).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="glass-panel mt-3">
                        <h5 className="mb-3">Product Preferences</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {["Flower","Edibles","Concentrates","Vapes","Pre-Rolls","Topicals","CBD","Indica","Sativa","Hybrid"].map(pref => {
                                const prefs = profile?.preferences?.categories || [];
                                const active = prefs.includes(pref);
                                return (
                                    <span key={pref} className={`badge ${active?"bg-success":"bg-secondary"}`}
                                        style={{cursor:"pointer",fontSize:"0.85rem",padding:"6px 12px"}}>
                                        {pref}
                                    </span>
                                );
                            })}
                        </div>
                        <small className="mt-2 d-block" style={{color:"rgba(255,255,255,0.4)"}}>Your preferences help us show you the most relevant products</small>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CustomerProfile;
