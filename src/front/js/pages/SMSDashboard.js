import React, { useState, useEffect } from "react";

const TEMPLATES = [
    { label:"Order Ready", msg:"Hi {name}! Your order #{order} is ready for pickup. Please bring your ID!" },
    { label:"Loyalty Reminder", msg:"Hi {name}! You have {points} loyalty points. Stop by and use them for discounts!" },
    { label:"New Deal", msg:"Hi {name}! We have a new deal just for you: {deal}. Come in today!" },
    { label:"Appointment Reminder", msg:"Hi {name}! Reminder: You have an appointment tomorrow. See you then!" },
];

const SMSDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ to:"", message:"" });
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState("");
    const [configured, setConfigured] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/sms/logs`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setLogs(Array.isArray(data)?data:[]); setConfigured(true); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/sms/send`, { method:"POST", headers, body:JSON.stringify(form) });
            const data = await r.json();
            if (data.success) { setStatus("✓ SMS sent!"); setForm({to:"",message:""}); }
            else setStatus("SMS failed — check Twilio configuration");
        } catch(e) { setStatus("Error: " + e.message); }
        finally { setSending(false); setTimeout(()=>setStatus(""), 3000); }
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📱 SMS Dashboard</h2><p>Send and track customer text messages</p></div>

            {!configured && (
                <div className="alert alert-warning mb-4">
                    <strong>Twilio not configured.</strong> Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file.
                </div>
            )}

            <div className="row g-4">
                <div className="col-md-5">
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Send SMS</h5>
                        <form onSubmit={handleSend}>
                            <div className="mb-3"><label className="form-label">Phone Number</label><input className="form-control" required placeholder="+16175551234" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} /></div>
                            <div className="mb-3"><label className="form-label">Message</label><textarea className="form-control" rows="4" required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Type your message..." maxLength="160" />
                                <small style={{color:"rgba(255,255,255,0.4)"}}>{form.message.length}/160 characters</small>
                            </div>
                            {status && <div className={`alert ${status.includes("✓")?"alert-success":"alert-danger"} py-2`}>{status}</div>}
                            <button type="submit" className="btn btn-success w-100" disabled={sending}>{sending?<span className="spinner-border spinner-border-sm"/>:"Send SMS"}</button>
                        </form>
                    </div>

                    <div className="glass-panel">
                        <h5 className="mb-3">Quick Templates</h5>
                        {TEMPLATES.map((t,i)=>(
                            <button key={i} className="btn btn-outline-light btn-sm w-100 mb-2 text-start"
                                onClick={()=>setForm({...form,message:t.msg})}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="col-md-7">
                    <div className="glass-panel">
                        <h5 className="mb-3">Recent Messages ({logs.length})</h5>
                        {loading ? <div className="spinner-border text-light"/>
                        : logs.length===0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>No messages sent yet</p>
                        : logs.map(log=>(
                            <div key={log.id} className="mb-2 p-3 rounded" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                                <div className="d-flex justify-content-between mb-1">
                                    <span style={{fontFamily:"monospace",fontSize:"0.85rem"}}>{log.to_number}</span>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className={`badge bg-${log.status==="sent"?"success":"danger"}`}>{log.status}</span>
                                        <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{log.created_at?new Date(log.created_at).toLocaleString():""}</span>
                                    </div>
                                </div>
                                <div style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>{log.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SMSDashboard;
