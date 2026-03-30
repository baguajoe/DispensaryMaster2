import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { useNavigate } from "react-router-dom";

const PatientList = () => {
    const { store, actions } = useContext(Context);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        actions.fetchPatients().then(() => setLoading(false));
    }, []);

    const patients = store.patients || [];
    const today = new Date();

    const filtered = patients.filter(p => {
        const name = `${p.first_name} ${p.last_name} ${p.email} ${p.medical_card_number}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase());
        const expired = p.expiration_date && new Date(p.expiration_date) < today;
        const expiringSoon = p.expiration_date && !expired &&
            (new Date(p.expiration_date) - today) / (1000*60*60*24) <= 30;
        const matchFilter = filter === "all" ||
            (filter === "expired" && expired) ||
            (filter === "expiring" && expiringSoon) ||
            (filter === "active" && !expired);
        return matchSearch && matchFilter;
    });

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this patient? This will also delete their prescriptions and appointments.")) return;
        await actions.deletePatient(id);
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>👥 Patient List</h2>
                    <p>{patients.length} registered medical patients</p>
                </div>
                <button className="btn btn-success" onClick={() => navigate("/medical/patient-registration")}>+ Register Patient</button>
            </div>

            {/* Filters */}
            <div className="glass-panel mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-md-6">
                        <input className="form-control" placeholder="Search by name, email, card number..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="col-md-6 d-flex gap-2">
                        {["all","active","expired","expiring"].map(f => (
                            <button key={f} className={`btn btn-sm ${filter===f?"btn-success":"btn-outline-light"} text-capitalize`}
                                onClick={() => setFilter(f)}>{f}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                {loading ? (
                    <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>👥</div>
                        <h5>No patients found</h5>
                        <button className="btn btn-success mt-2" onClick={() => navigate("/medical/patient-registration")}>Register First Patient</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead>
                            <tr><th>Patient</th><th>Card #</th><th>Physician</th><th>Conditions</th><th>Card Expires</th><th>Rxs</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => {
                                const expired = p.expiration_date && new Date(p.expiration_date) < today;
                                const expiringSoon = !expired && p.expiration_date &&
                                    (new Date(p.expiration_date) - today) / (1000*60*60*24) <= 30;
                                return (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{fontWeight:600}}>{p.first_name} {p.last_name}</div>
                                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{p.email}</div>
                                        </td>
                                        <td style={{fontSize:"0.85rem"}}>{p.medical_card_number}</td>
                                        <td style={{fontSize:"0.85rem"}}>{p.physician_name}</td>
                                        <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",maxWidth:"150px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.conditions||"—"}</td>
                                        <td>
                                            <span className={`badge ${expired?"bg-danger":expiringSoon?"bg-warning text-dark":"bg-success"}`}>
                                                {p.expiration_date ? new Date(p.expiration_date).toLocaleDateString() : "—"}
                                            </span>
                                        </td>
                                        <td>{p.prescription_count||0}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-light me-1"
                                                onClick={() => navigate(`/medical/patient-registration?id=${p.id}`)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-info me-1"
                                                onClick={() => navigate(`/medical/prescription-management?patient_id=${p.id}`)}>Rx</button>
                                            <button className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(p.id)}>Del</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default PatientList;
