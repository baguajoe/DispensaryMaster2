import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PatientRegistration = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        first_name:"", last_name:"", email:"", phone:"",
        medical_card_number:"", expiration_date:"",
        physician_name:"", conditions:"", dob:""
    });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/medical/patients`, {
                method:"POST", headers, body:JSON.stringify(form)
            });
            const data = await r.json();
            if (r.ok) {
                navigate(`/medical/patients`);
            } else {
                setError(data.error || "Registration failed");
            }
        } catch(e) { setError("Connection error"); }
        finally { setSaving(false); }
    };

    const u = (field, value) => setForm({...form, [field]: value});

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🏥 Register New Patient</h2><p>Complete all required fields</p></div>
                <button className="btn btn-outline-light" onClick={() => navigate("/medical/patients")}>← Back to List</button>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Personal Information</h5>
                    <div className="row g-3">
                        <div className="col-md-3"><label className="form-label">First Name *</label><input className="form-control" required value={form.first_name} onChange={e=>u("first_name",e.target.value)} /></div>
                        <div className="col-md-3"><label className="form-label">Last Name *</label><input className="form-control" required value={form.last_name} onChange={e=>u("last_name",e.target.value)} /></div>
                        <div className="col-md-3"><label className="form-label">Date of Birth</label><input className="form-control" type="date" value={form.dob} onChange={e=>u("dob",e.target.value)} /></div>
                        <div className="col-md-3"><label className="form-label">Phone *</label><input className="form-control" required value={form.phone} onChange={e=>u("phone",e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">Email *</label><input className="form-control" type="email" required value={form.email} onChange={e=>u("email",e.target.value)} /></div>
                    </div>
                </div>

                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Medical Card Information</h5>
                    <div className="row g-3">
                        <div className="col-md-4"><label className="form-label">Medical Card Number *</label><input className="form-control" required value={form.medical_card_number} onChange={e=>u("medical_card_number",e.target.value)} placeholder="MC-XXXX-XXXX" /></div>
                        <div className="col-md-4"><label className="form-label">Card Expiration Date *</label><input className="form-control" type="date" required value={form.expiration_date} onChange={e=>u("expiration_date",e.target.value)} /></div>
                        <div className="col-md-4"><label className="form-label">Physician Name *</label><input className="form-control" required value={form.physician_name} onChange={e=>u("physician_name",e.target.value)} /></div>
                        <div className="col-12"><label className="form-label">Medical Conditions / Qualifying Conditions</label><textarea className="form-control" rows="3" value={form.conditions} onChange={e=>u("conditions",e.target.value)} placeholder="e.g. Chronic pain, PTSD, Anxiety, Glaucoma..." /></div>
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <button type="button" className="btn btn-outline-light" onClick={()=>navigate("/medical/patients")}>Cancel</button>
                    <button type="submit" className="btn btn-success flex-grow-1 py-3" disabled={saving}>
                        {saving ? <span className="spinner-border spinner-border-sm me-2"/> : ""}
                        {saving ? "Registering..." : "Register Patient"}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default PatientRegistration;
