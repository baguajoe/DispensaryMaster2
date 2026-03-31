import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setPatients(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = patients.filter(p => {
        const matchSearch = `${p.first_name} ${p.last_name} ${p.email} ${p.medical_card_number}`.toLowerCase().includes(search.toLowerCase());
        const today = new Date();
        const expiry = p.expiration_date ? new Date(p.expiration_date) : null;
        const expiringSoon = expiry && (expiry - today) / (1000 * 60 * 60 * 24) < 30;
        const expired = expiry && expiry < today;
        if (filter === "expiring") return matchSearch && expiringSoon;
        if (filter === "expired") return matchSearch && expired;
        return matchSearch;
    });

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🏥 Patient List</h2><p>{patients.length} registered patients</p></div>
                <button className="btn btn-success" onClick={() => navigate("/medical/register")}>+ Register Patient</button>
            </div>

            <div className="row g-3 mb-4">
                {[
                    {l:"Total Patients", v:patients.length, c:"#11cdef"},
                    {l:"Active Cards", v:patients.filter(p=>p.expiration_date && new Date(p.expiration_date) > new Date()).length, c:"#2dce89"},
                    {l:"Expiring Soon", v:patients.filter(p=>{const d=new Date(p.expiration_date);return (d-new Date())/(86400000)<30 && d>new Date();}).length, c:"#ffd600"},
                    {l:"Expired", v:patients.filter(p=>p.expiration_date && new Date(p.expiration_date)<new Date()).length, c:"#f5365c"},
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:s.c}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            <div className="glass-panel mb-3 d-flex gap-3">
                <input className="form-control" placeholder="Search by name, email, or card number..." value={search} onChange={e=>setSearch(e.target.value)} />
                <select className="form-select" style={{maxWidth:"200px"}} value={filter} onChange={e=>setFilter(e.target.value)}>
                    <option value="all">All Patients</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            <div className="glass-panel">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                            <th>Patient</th><th>Medical Card</th><th>Physician</th><th>Conditions</th><th>Card Expires</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(p => {
                                const expiry = p.expiration_date ? new Date(p.expiration_date) : null;
                                const daysLeft = expiry ? Math.floor((expiry - new Date()) / 86400000) : null;
                                const expiryColor = daysLeft === null ? "#fff" : daysLeft < 0 ? "#f5365c" : daysLeft < 30 ? "#ffd600" : "#2dce89";
                                return (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{fontWeight:600}}>{p.first_name} {p.last_name}</div>
                                            <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{p.email}</div>
                                        </td>
                                        <td style={{fontFamily:"monospace",fontSize:"0.85rem"}}>{p.medical_card_number}</td>
                                        <td style={{fontSize:"0.85rem"}}>{p.physician_name}</td>
                                        <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",maxWidth:"150px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.conditions||"—"}</td>
                                        <td><span style={{color:expiryColor,fontWeight:600,fontSize:"0.85rem"}}>{p.expiration_date || "—"}{daysLeft !== null && daysLeft < 30 && daysLeft >= 0 && <span style={{fontSize:"0.7rem",marginLeft:"4px"}}>({daysLeft}d)</span>}</span></td>
                                        <td><button className="btn btn-outline-light btn-sm" onClick={()=>navigate(`/medical/patient/${p.id}`)}>View</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No patients found</div>}
            </div>
        </div>
    );
};
export default PatientList;
