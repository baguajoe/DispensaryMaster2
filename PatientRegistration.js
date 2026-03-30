import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PatientRegistration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("id");

    const [form, setForm] = useState({
        first_name:"", last_name:"", email:"", phone:"",
        date_of_birth:"", medical_card_number:"", expiration_date:"",
        physician_name:"", conditions:"", notes:"",
        verification_status:"pending"
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!editId);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        if (!editId) return;
        fetch(`${process.env.BACKEND_URL}/api/medical/patients/${editId}`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    setForm({
                        first_name: data.first_name || "",
                        last_name: data.last_name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        date_of_birth: data.date_of_birth?.split("T")[0] || "",
                        medical_card_number: data.medical_card_number || "",
                        expiration_date: data.expiration_date?.split("T")[0] || "",
                        physician_name: data.physician_name || "",
                        conditions: data.conditions || "",
                        notes: data.notes || "",
                        verification_status: data.verification_status || "pending",
                    });
                }
                setLoading(false);
            }).catch(() => setLoading(false));
    }, [editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const method = editId ? "PUT" : "POST";
            const url = editId
                ? `${process.env.BACKEND_URL}/api/medical/patients/${editId}`
                : `${process.env.BACKEND_URL}/api/medical/patients`;
            const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
            if (r.ok) {
                setSuccess(editId ? "Patient updated successfully!" : "Patient registered successfully!");
                setTimeout(() => navigate("/medical/patient-list"), 1500);
            } else {
                const err = await r.json();
                setError(err.error || "Failed to save patient");
            }
        } catch(e) { setError("Network error. Please try again."); }
        finally { setSaving(false); }
    };

    const update = (field, value) => setForm(prev => ({...prev, [field]:value}));

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>🏥 {editId ? "Edit Patient" : "Register New Patient"}</h2>
                    <p>{editId ? "Update patient information" : "Create a new medical patient record"}</p>
                </div>
                <button className="btn btn-outline-light" onClick={() => navigate("/medical/patient-list")}>← Back to List</button>
            </div>

            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {success && <div className="alert alert-success mb-3">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* Personal Info */}
                    <div className="col-md-6">
                        <div className="glass-panel">
                            <h5 className="mb-3">Personal Information</h5>
                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="form-label">First Name *</label>
                                    <input className="form-control" required value={form.first_name} onChange={e => update("first_name", e.target.value)} />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Last Name *</label>
                                    <input className="form-control" required value={form.last_name} onChange={e => update("last_name", e.target.value)} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Email *</label>
                                    <input className="form-control" type="email" required value={form.email} onChange={e => update("email", e.target.value)} />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Phone *</label>
                                    <input className="form-control" required value={form.phone} onChange={e => update("phone", e.target.value)} />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Date of Birth</label>
                                    <input className="form-control" type="date" value={form.date_of_birth} onChange={e => update("date_of_birth", e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Card */}
                    <div className="col-md-6">
                        <div className="glass-panel">
                            <h5 className="mb-3">Medical Card Details</h5>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Medical Card Number</label>
                                    <input className="form-control" value={form.medical_card_number} onChange={e => update("medical_card_number", e.target.value)} placeholder="e.g. MC-2024-00123" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Expiration Date</label>
                                    <input className="form-control" type="date" value={form.expiration_date} onChange={e => update("expiration_date", e.target.value)} />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Verification Status</label>
                                    <select className="form-select" value={form.verification_status} onChange={e => update("verification_status", e.target.value)}>
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Physician Name</label>
                                    <input className="form-control" value={form.physician_name} onChange={e => update("physician_name", e.target.value)} placeholder="Dr. Smith" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="col-12">
                        <div className="glass-panel">
                            <h5 className="mb-3">Medical Information</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Medical Conditions</label>
                                    <textarea className="form-control" rows="3" value={form.conditions} onChange={e => update("conditions", e.target.value)} placeholder="e.g. Chronic pain, Anxiety, PTSD..." />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Additional Notes</label>
                                    <textarea className="form-control" rows="3" value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Any relevant notes..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 d-flex gap-3">
                        <button type="button" className="btn btn-outline-light" onClick={() => navigate("/medical/patient-list")}>Cancel</button>
                        <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>
                            {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            {editId ? "Update Patient" : "Register Patient"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default PatientRegistration;
