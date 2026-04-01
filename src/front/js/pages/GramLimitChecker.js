import React, { useState } from "react";

const STATES = ["MA","CA","CO","WA","OR","IL","NV","AZ","MI","NY","FL","PA","NJ","CT","RI","VT","ME","MN"];
const STATE_LIMITS = { MA:28,CA:28.35,CO:28,WA:28,OR:28,IL:30,NV:28,AZ:28,MI:42,NY:85 };

const GramLimitChecker = () => {
    const [form, setForm] = useState({ customer_id:"", grams:"", state:"MA" });
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const handleCheck = async (e) => {
        e.preventDefault();
        setChecking(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/compliance/gram-limit-check`, { method:"POST", headers, body:JSON.stringify(form) });
            const data = await r.json();
            setResult(data);
        } catch(e) { console.error(e); }
        finally { setChecking(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>⚖️ Gram Limit Compliance</h2><p>State-mandated purchase limits per customer per day</p></div>
            <div className="row g-4">
                <div className="col-md-5">
                    <div className="glass-panel">
                        <h5 className="mb-3">Check Purchase Limit</h5>
                        <form onSubmit={handleCheck}>
                            <div className="mb-3"><label className="form-label">Customer ID</label><input className="form-control" required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} /></div>
                            <div className="mb-3"><label className="form-label">Requested Grams</label><input className="form-control" type="number" step="0.1" min="0" required value={form.grams} onChange={e=>setForm({...form,grams:e.target.value})} /></div>
                            <div className="mb-3">
                                <label className="form-label">State</label>
                                <select className="form-select" value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>
                                    {STATES.map(s=><option key={s}>{s}</option>)}
                                </select>
                                <small style={{color:"rgba(255,255,255,0.5)"}}>Daily limit: {STATE_LIMITS[form.state]||28}g</small>
                            </div>
                            <button type="submit" className="btn btn-success w-100" disabled={checking}>{checking?<span className="spinner-border spinner-border-sm"/>:"Check Limit"}</button>
                        </form>
                    </div>
                </div>
                <div className="col-md-7">
                    {result && (
                        <div className={`glass-panel ${result.allowed?"":"border border-danger"}`} style={{borderColor:result.allowed?"rgba(45,206,137,0.4)":"rgba(245,54,92,0.4)"}}>
                            <div className="text-center mb-4">
                                <div style={{fontSize:"4rem"}}>{result.allowed?"✅":"🚫"}</div>
                                <h3 style={{color:result.allowed?"#2dce89":"#f5365c"}}>{result.allowed?"PURCHASE ALLOWED":"PURCHASE DENIED"}</h3>
                                <p style={{color:"rgba(255,255,255,0.6)"}}>{result.allowed?`Customer can purchase ${result.requested_grams}g`:`Exceeds daily limit of ${result.daily_limit}g`}</p>
                            </div>
                            <div className="row g-3">
                                {[{l:"Requested",v:`${result.requested_grams}g`,c:"#11cdef"},{l:"Purchased Today",v:`${result.grams_purchased_today}g`,c:"#ffd600"},{l:"Daily Limit",v:`${result.daily_limit}g`,c:"#fb6340"},{l:"Remaining",v:`${result.remaining_allowed.toFixed(1)}g`,c:result.remaining_allowed>0?"#2dce89":"#f5365c"}].map((s,i)=>(
                                    <div key={i} className="col-6 text-center">
                                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                                        <div style={{fontSize:"1.5rem",fontWeight:700,color:s.c}}>{s.v}</div>
                                    </div>
                                ))}
                            </div>
                            {!result.allowed && (
                                <div className="alert alert-danger mt-3 mb-0">
                                    Customer has purchased {result.grams_purchased_today}g today. Maximum allowed is {result.daily_limit}g per day in {result.state}. They may purchase up to {result.remaining_allowed.toFixed(1)}g more.
                                </div>
                            )}
                        </div>
                    )}
                    <div className="glass-panel mt-3">
                        <h5 className="mb-3">State Limits Reference</h5>
                        <div className="row g-2">
                            {Object.entries(STATE_LIMITS).map(([state,limit])=>(
                                <div key={state} className="col-4 col-md-3">
                                    <div className="text-center p-2 rounded" style={{background:"rgba(255,255,255,0.06)"}}>
                                        <div style={{fontWeight:700}}>{state}</div>
                                        <div style={{fontSize:"0.85rem",color:"#2dce89"}}>{limit}g/day</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GramLimitChecker;
