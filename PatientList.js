import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setPatients(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this patient record?")) return;
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/medical/patients/${id}`, { method:"DELETE", headers });
            if (r.ok) setPatients(prev => prev.filter(p => p.id !== id));
        } catch(e) { console.error(e); }
    };

    const today = new Date();
    const isExpired = (p) => p.expiration_date && new Date(p.expiration_date) < today;
    const isExpiringSoon = (p) => {
        if (!p.expiration_date) return false;
        const diff = (new Date(p.expiration_date) - today) / (1000*60*60*24);
        return diff >= 0 && diff <= 30;
    };

    const filtered = patients.filter(p => {
        const name = `${p.first_name} ${p.last_name} ${p.email} ${p.medical_card_number}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase());
        const matchFilter = filter === "all" || (filter === "expired" && isExpired(p)) || (filter === "expiring" && isExpiringSoon(p)) || (filter === "verified" && p.verification_status === "verified");
        return matchSearch && matchFilter;
    });

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>👥 Patient List</h2>
                    <p>{patients.length} registered patients</p>
                </div>
                <button className="btn btn-success" onClick={() => navigate("/medical/patient-registration")}>+ Register Patient</button>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Total", value:patients.length, color:"#11cdef" },
                    { label:"Expired Cards", value:patients.filter(isExpired).length, color:"#f5365c" },
                    { label:"Expiring Soon", value:patients.filter(isExpiringSoon).length, color:"#ffd600" },
                    { label:"Verified", value:patients.filter(p=>p.verification_status==="verified").length, color:"#2dce89" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="glass-panel mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-md-6">
                        <input className="form-control" placeholder="Search by name, email, or card #..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="col-md-6 d-flex gap-2 flex-wrap">
                        {["all","expired","expiring","verified"].map(f => (
                            <button key={f} className={`btn btn-sm ${filter===f?"btn-success":"btn-outline-light"} text-capitalize`} onClick={() => setFilter(f)}>
                                {f === "expiring" ? "Expiring Soon" : f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Patient Table */}
            <div className="glass-panel">
                {filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>👥</div>
                        <h5>No patients found</h5>
                        {search && <p>Try adjusting your search</p>}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Card #</th>
                                    <th>Expiration</th>
                                    <th>Physician</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => {
                                    const expired = isExpired(p);
                                    const expiring = isExpiringSoon(p);
                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{fontWeight:600}}>{p.first_name} {p.last_name}</div>
                                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{p.email}</div>
                                            </td>
                                            <td style={{fontFamily:"monospace"}}>{p.medical_card_number || "—"}</td>
                                            <td>
                                                <span className={`badge bg-${expired?"danger":expiring?"warning text-dark":"success"}`}>
                                                    {p.expiration_date ? new Date(p.expiration_date).toLocaleDateString() : "—"}
                                                </span>
                                            </td>
                                            <td>{p.physician_name || "—"}</td>
                                            <td>
                                                <span className={`badge bg-${p.verification_status==="verified"?"success":"warning text-dark"}`}>
                                                    {p.verification_status || "pending"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/medical/patient-profile/${p.id}`)}>View</button>
                                                    <button className="btn btn-sm btn-outline-warning" onClick={() => navigate(`/medical/patient-registration?id=${p.id}`)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Del</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default PatientList;
