import React, { useState, useEffect } from "react";

const FAQ = [
    { q:"How do I track my order?", a:"Go to Order History in your dashboard to see real-time status of all your orders." },
    { q:"How do I earn loyalty points?", a:"You earn 1 point for every $1 spent. Check the Loyalty Program page for full details and how to redeem." },
    { q:"What payment methods do you accept?", a:"We accept cash, debit, and select digital payment methods. Check with the dispensary for current options." },
    { q:"Can I modify or cancel my order?", a:"Contact us immediately if you need to modify or cancel. Once processed, changes may not be possible." },
    { q:"How do I verify my age/medical card?", a:"Bring a valid government-issued ID or medical card to any visit. Online verification may also be available." },
    { q:"What is your return policy?", a:"Due to the nature of cannabis products, we generally cannot accept returns. Contact us if there's an issue with your order." },
];

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ subject:"", category:"Order Issue", message:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/customer/support/tickets`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => setTickets(Array.isArray(data)?data:[]))
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/customer/support/tickets`, {
                method:"POST", headers, body: JSON.stringify(form)
            });
            if (r.ok) {
                const data = await r.json();
                setTickets(t => [data, ...t]);
                setShowForm(false);
                setForm({ subject:"", category:"Order Issue", message:"" });
                alert("✅ Support ticket submitted! We'll get back to you soon.");
            }
        } catch(e) { console.error(e); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>💬 Help & Support</h2><p>Get help with your orders and account</p></div>
                <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>+ New Ticket</button>
            </div>

            {/* New Ticket Form */}
            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Submit Support Request</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Subject *</label>
                                <input className="form-control" required value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} placeholder="Brief description of your issue" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                                    {["Order Issue","Payment Issue","Account Issue","Product Question","Loyalty Points","Other"].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Message *</label>
                                <textarea className="form-control" rows="4" required value={form.message} onChange={e => setForm({...form,message:e.target.value})} placeholder="Describe your issue in detail..." />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={submitting}>
                                    {submitting ? <span className="spinner-border spinner-border-sm" /> : "Submit Ticket"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* My Tickets */}
            {tickets.length > 0 && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">My Support Tickets</h5>
                    {tickets.map(t => (
                        <div key={t.id} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                            <div>
                                <div style={{fontWeight:600,fontSize:"0.9rem"}}>#{t.id} — {t.subject}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : "Recently"}</div>
                            </div>
                            <span className={`badge bg-${t.status==="Open"?"warning text-dark":t.status==="Resolved"?"success":"secondary"}`}>{t.status}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* FAQ */}
            <div className="glass-panel">
                <h5 className="mb-3">Frequently Asked Questions</h5>
                {FAQ.map((item,i) => (
                    <div key={i} className="mb-2 rounded overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.1)"}}>
                        <div className="d-flex justify-content-between align-items-center p-3"
                            style={{background:"rgba(255,255,255,0.06)",cursor:"pointer"}}
                            onClick={() => setExpanded(expanded===i?null:i)}>
                            <span style={{fontWeight:600,fontSize:"0.9rem"}}>{item.q}</span>
                            <span style={{color:"rgba(255,255,255,0.4)"}}>{expanded===i?"▲":"▼"}</span>
                        </div>
                        {expanded === i && (
                            <div className="p-3" style={{background:"rgba(0,0,0,0.2)",color:"rgba(255,255,255,0.7)",fontSize:"0.9rem"}}>
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Support;
