import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const CONDITIONS = ["Chronic Pain","Anxiety","PTSD","Cancer","Epilepsy","Glaucoma","MS","Crohn's Disease","HIV/AIDS","Arthritis","Insomnia","Depression","Nausea","Other"];

const PatientRegistration = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("id");
    const [saving, setSaving] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [form, setForm] = useState({
        first_name:"", last_name:"", email:"", phone:"",
        medical_card_number:"", expiration_date:"",
        physician_name:"", conditions:""
    });

    useEffect(() => {
        if (editId) {
            const patient = (store.patients||[]).find(p => String(p.id) === editId);
            if (patient) {
                setForm({
                    first_name: patient.first_name||"",
                    last_name: patient.last_name||"",
                    email: patient.email||"",
                    phone: patient.phone||"",
                    medical_card_number: patient.medical_card_number||"",
                    expiration_date: patient.expiration_date||"",
                    physician_name: patient.physician_name||"",
                    conditions: patient.conditions||""
                });
                if (patient.conditions) {
                    setSelectedConditions(patient.conditions.split(",").map(c => c.trim()));
                }
            }
        }
    }, [editId, store.patients]);

    const toggleCondition = (c) => {
        const updated = selectedConditions.includes(c)
            ? selectedConditions.filter(x => x !== c)
            : [...selectedConditions, c];
        setSelectedConditions(updated);
        setForm({...form, conditions: updated.join(", ")});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = editId
            ? await actions.editPatient(editId, form)
            : await actions.addPatient(form);
        if (result?.success) {
            navigate("/medical/patient-list");
        } else {
            alert(result?.error || "Failed to save patient");
            setSaving(false);
        }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>{editId ? "Edit Patient" : "🏥 Register New Patient"}</h2>
                    <p>Medical cannabis patient registration</p>
                </div>
                <button className="btn btn-outline-light" onClick={() => navigate("/medical/patient-list")}>← Back to Patients</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* Personal Info */}
                    <div className="col-md-8">
                        <div className="glass-panel mb-4">
                            <h5 className="mb-3">Personal Information</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">First Name *</label>
                                    <input className="form-control" required value={form.first_name} onChange={e => setForm({...form,first_name:e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Last Name *</label>
                                    <input className="form-control" required value={form.last_name} onChange={e => setForm({...form,last_name:e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email *</label>
                                    <input className="form-control" type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone *</label>
                                    <input className="form-control" required value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel mb-4">
                            <h5 className="mb-3">Medical Card Information</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Medical Card Number</label>
                                    <input className="form-control" placeholder="Auto-generated if blank" value={form.medical_card_number} onChange={e => setForm({...form,medical_card_number:e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Card Expiration Date *</label>
                                    <input className="form-control" type="date" required value={form.expiration_date} onChange={e => setForm({...form,expiration_date:e.target.value})} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Recommending Physician *</label>
                                    <input className="form-control" required value={form.physician_name} onChange={e => setForm({...form,physician_name:e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="col-md-4">
                        <div className="glass-panel h-100">
                            <h5 className="mb-3">Medical Conditions</h5>
                            <p style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>Select all qualifying conditions</p>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {CONDITIONS.map(c => (
                                    <button key={c} type="button"
                                        className={`btn btn-sm ${selectedConditions.includes(c)?"btn-success":"btn-outline-light"}`}
                                        onClick={() => toggleCondition(c)}>{c}</button>
                                ))}
                            </div>
                            {selectedConditions.length > 0 && (
                                <div className="p-2 rounded" style={{background:"rgba(45,206,137,0.1)",border:"1px solid rgba(45,206,137,0.3)"}}>
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.6)"}}>Selected:</div>
                                    <div style={{fontSize:"0.85rem"}}>{selectedConditions.join(", ")}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-light" onClick={() => navigate("/medical/patient-list")}>Cancel</button>
                    <button type="submit" className="btn btn-success flex-grow-1 py-2 fw-semibold" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : editId ? "Update Patient" : "Register Patient"}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default PatientRegistration;
