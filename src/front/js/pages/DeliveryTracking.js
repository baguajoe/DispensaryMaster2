import React, { useState, useEffect } from "react";

const STATUS_STEPS = ["pending","assigned","en_route","delivered"];
const STATUS_LABELS = { pending:"Order Placed", assigned:"Driver Assigned", en_route:"On The Way", delivered:"Delivered" };
const STATUS_ICONS = { pending:"📦", assigned:"🚗", en_route:"🏃", delivered:"✅" };

const DeliveryTracking = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ order_id:"", customer_id:"", delivery_address:"", notes:"" });
    const [updating, setUpdating] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/deliveries`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setDeliveries(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); const interval = setInterval(load, 30000); return () => clearInterval(interval); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const r = await fetch(`${process.env.BACKEND_URL}/api/deliveries`, { method:"POST", headers, body:JSON.stringify(form) });
        if (r.ok) { load(); setShowCreate(false); }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdating(true);
        await fetch(`${process.env.BACKEND_URL}/api/deliveries/${id}/location`, {
            method:"PUT", headers, body:JSON.stringify({ status:newStatus })
        });
        load();
        setUpdating(false);
    };

    const handleSMS = async (id, type) => {
        await fetch(`${process.env.BACKEND_URL}/api/sms/delivery-update/${id}`, { method:"POST", headers });
        alert("SMS sent to customer!");
    };

    const STATUS_COLOR = { pending:"#ffd600", assigned:"#11cdef", en_route:"#fb6340", delivered:"#2dce89" };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🚗 Delivery Tracking</h2><p>{deliveries.filter(d=>d.status!=="delivered").length} active deliveries</p></div>
                <button className="btn btn-success" onClick={()=>setShowCreate(!showCreate)}>+ New Delivery</button>
            </div>

            <div className="row g-3 mb-4">
                {[{l:"Pending",s:"pending",c:"#ffd600"},{l:"Assigned",s:"assigned",c:"#11cdef"},{l:"En Route",s:"en_route",c:"#fb6340"},{l:"Delivered",s:"delivered",c:"#2dce89"}].map(({l,s,c})=>(
                    <div key={s} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:c}}>{deliveries.filter(d=>d.status===s).length}</div>
                    </div></div>
                ))}
            </div>

            {showCreate && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Create Delivery</h5>
                    <form onSubmit={handleCreate}>
                        <div className="row g-3">
                            <div className="col-md-3"><label className="form-label">Order ID</label><input className="form-control" required value={form.order_id} onChange={e=>setForm({...form,order_id:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Customer ID</label><input className="form-control" required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Delivery Address</label><input className="form-control" required value={form.delivery_address} onChange={e=>setForm({...form,delivery_address:e.target.value})} /></div>
                            <div className="col-md-2 d-flex align-items-end"><button type="submit" className="btn btn-success w-100">Create</button></div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                <div className="col-md-5">
                    <div className="glass-panel">
                        <h5 className="mb-3">Active Deliveries</h5>
                        {deliveries.map(d=>(
                            <div key={d.id} className="mb-2 p-3 rounded" style={{background:selected?.id===d.id?"rgba(45,206,137,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${selected?.id===d.id?"rgba(45,206,137,0.4)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}} onClick={()=>setSelected(d)}>
                                <div className="d-flex justify-content-between">
                                    <div style={{fontWeight:600}}>Order #{d.order_id}</div>
                                    <span className="badge" style={{background:STATUS_COLOR[d.status]+"33",color:STATUS_COLOR[d.status]}}>{STATUS_LABELS[d.status]}</span>
                                </div>
                                <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",marginTop:"4px"}}>📍 {d.delivery_address?.slice(0,40)}</div>
                            </div>
                        ))}
                        {deliveries.length===0 && <p style={{color:"rgba(255,255,255,0.5)"}}>No deliveries yet</p>}
                    </div>
                </div>
                <div className="col-md-7">
                    {!selected ? (
                        <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>🚗</div><h5>Select a delivery</h5></div>
                    ) : (
                        <div className="glass-panel">
                            <h5 className="mb-4">Order #{selected.order_id} — Tracking</h5>
                            <div className="d-flex justify-content-between mb-4">
                                {STATUS_STEPS.map((step,i)=>{
                                    const currentIdx = STATUS_STEPS.indexOf(selected.status);
                                    const done = i <= currentIdx;
                                    return (
                                        <div key={step} className="text-center flex-grow-1">
                                            <div style={{fontSize:"1.8rem",opacity:done?1:0.3}}>{STATUS_ICONS[step]}</div>
                                            <div style={{fontSize:"0.7rem",color:done?"#2dce89":"rgba(255,255,255,0.3)",marginTop:"4px"}}>{STATUS_LABELS[step]}</div>
                                            {i<STATUS_STEPS.length-1&&<div style={{height:"2px",background:done?"#2dce89":"rgba(255,255,255,0.1)",marginTop:"8px"}}/>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mb-3">
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>DELIVERY ADDRESS</div>
                                <div>{selected.delivery_address}</div>
                            </div>
                            <h6 className="mb-2">Update Status</h6>
                            <div className="d-flex gap-2 flex-wrap mb-3">
                                {STATUS_STEPS.filter(s=>s!==selected.status).map(s=>(
                                    <button key={s} className="btn btn-outline-light btn-sm" disabled={updating} onClick={()=>{handleStatusUpdate(selected.id,s);setSelected({...selected,status:s});}}>
                                        {STATUS_ICONS[s]} {STATUS_LABELS[s]}
                                    </button>
                                ))}
                            </div>
                            <button className="btn btn-outline-info btn-sm" onClick={()=>handleSMS(selected.id,selected.status)}>📱 Send SMS Update</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default DeliveryTracking;
