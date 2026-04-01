import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const STRAINS = ["Blue Dream","OG Kush","Girl Scout Cookies","Gelato","Runtz","White Widow","Gorilla Glue","AK-47","Sour Diesel","Jack Herer","Custom"];

const AddPlantBatch = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ strain:"", yield_amount:"", start_date:new Date().toISOString().split("T")[0], end_date:"", status:"Seedling", notes:"" });
    const [customStrain, setCustomStrain] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.strain) return alert("Strain name is required");
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { method:"POST", headers, body: JSON.stringify(form) });
            if (r.ok) navigate("/growfarms/plant-batch-list");
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🌱 Add Plant Batch</h2><p>Start tracking a new grow batch</p></div>
                <button className="btn btn-outline-light" onClick={() => navigate("/growfarms/plant-batch-list")}>← Back</button>
            </div>
            <div className="glass-panel" style={{maxWidth:"700px"}}>
                <form onSubmit={handleSave}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Strain *</label>
                            {!customStrain ? (
                                <div className="d-flex gap-2">
                                    <select className="form-select flex-grow-1" value={form.strain} onChange={e => {
                                        if (e.target.value === "Custom") { setCustomStrain(true); setForm({...form,strain:""}); }
                                        else setForm({...form,strain:e.target.value});
                                    }}>
                                        <option value="">-- Select Strain --</option>
                                        {STRAINS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="d-flex gap-2">
                                    <input className="form-control flex-grow-1" placeholder="Enter strain name..." value={form.strain} onChange={e => setForm({...form,strain:e.target.value})} />
                                    <button type="button" className="btn btn-outline-light btn-sm" onClick={() => { setCustomStrain(false); setForm({...form,strain:""}); }}>↩</button>
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Start Date</label>
                            <input className="form-control" type="date" value={form.start_date} onChange={e => setForm({...form,start_date:e.target.value})} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Expected Harvest Date</label>
                            <input className="form-control" type="date" value={form.end_date} onChange={e => setForm({...form,end_date:e.target.value})} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Initial Status</label>
                            <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                                {["Seedling","Vegetative","Flowering","Drying"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Expected Yield (lbs)</label>
                            <input className="form-control" type="number" step="0.1" value={form.yield_amount} onChange={e => setForm({...form,yield_amount:e.target.value})} />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Notes</label>
                            <textarea className="form-control" rows="3" placeholder="Growing environment, nutrients used, special notes..." value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} />
                        </div>
                        <div className="col-12 d-flex gap-2">
                            <button type="button" className="btn btn-outline-light" onClick={() => navigate("/growfarms/plant-batch-list")}>Cancel</button>
                            <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>
                                {saving ? <span className="spinner-border spinner-border-sm" /> : "🌱 Create Batch"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddPlantBatch;
