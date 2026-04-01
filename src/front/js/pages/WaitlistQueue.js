import React, { useState, useEffect } from "react";

const WaitlistQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ customer_id:"", store_id:"1", notes:"" });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/waitlist?store_id=1`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setQueue(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); const interval = setInterval(load, 15000); return () => clearInterval(interval); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/waitlist`, { method:"POST", headers, body:JSON.stringify(form) });
        if (r.ok) { load(); setForm({ customer_id:"", store_id:"1", notes:"" }); }
        setAdding(false);
    };

    const handleCall = async (id) => {
        await fetch(`${process.env.BACKEND_URL}/api/waitlist/${id}/call`, { method:"PUT", headers });
        load();
    };

    const handleServe = async (id) => {
        await fetch(`${process.env.BACKEND_URL}/api/waitlist/${id}/serve`, { method:"PUT", headers });
        load();
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🔢 Waitlist & Queue</h2><p>{queue.length} customers waiting · Auto-refreshes every 15s</p></div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Add to Queue</h5>
                        <form onSubmit={handleAdd}>
                            <div className="mb-3"><label className="form-label">Customer ID</label><input className="form-control" required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} placeholder="Customer ID" /></div>
                            <div className="mb-3"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Medical, pickup, etc." /></div>
                            <button type="submit" className="btn btn-success w-100" disabled={adding}>{adding?<span className="spinner-border spinner-border-sm"/>:"Add to Queue"}</button>
                        </form>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="glass-panel">
                        <h5 className="mb-3">Current Queue</h5>
                        {loading ? <div className="spinner-border text-light"/>
                        : queue.length===0 ? <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>🎉</div><p>No one waiting!</p></div>
                        : queue.map(entry=>(
                            <div key={entry.id} className="d-flex justify-content-between align-items-center mb-2 p-3 rounded"
                                style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"#2dce89",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"1.1rem"}}>#{entry.position}</div>
                                    <div>
                                        <div style={{fontWeight:600}}>Customer #{entry.customer_id}</div>
                                        {entry.notes && <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{entry.notes}</div>}
                                        <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{entry.created_at?`Waiting since ${new Date(entry.created_at).toLocaleTimeString()}`:"Just joined"}</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <span className={`badge bg-${entry.status==="waiting"?"warning text-dark":entry.status==="called"?"info":"success"}`}>{entry.status}</span>
                                    {entry.status==="waiting" && <button className="btn btn-sm btn-success" onClick={()=>handleCall(entry.id)}>📢 Call</button>}
                                    {entry.status==="called" && <button className="btn btn-sm btn-outline-success" onClick={()=>handleServe(entry.id)}>✓ Served</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default WaitlistQueue;
