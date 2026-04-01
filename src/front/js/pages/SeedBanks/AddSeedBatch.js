import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SEED_STRAINS = ["Blue Dream","OG Kush","Girl Scout Cookies","Gelato","Runtz","White Widow","Gorilla Glue","AK-47","Sour Diesel","Jack Herer","Northern Lights","Purple Haze","Custom"];
const STORAGE_LOCS = ["Vault A","Vault B","Cold Storage","Room 1","Room 2","Refrigerated Unit","Off-site Storage"];

const AddSeedBatch = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [customStrain, setCustomStrain] = useState(false);
    const [form, setForm] = useState({ strain:"", batch_number:"", quantity:"", storage_location:"", expiration_date:"", germination_rate:"", notes:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.strain || !form.quantity) return alert("Strain and quantity are required");
        setSaving(true);
        try {
            const batchNum = form.batch_number || `SB-${Date.now().toString().slice(-6)}`;
            const r = await fetch(`${process.env.BACKEND_URL}/api/seed_batches`, {
                method:"POST", headers,
                body: JSON.stringify({ ...form, batch_number: batchNum, quantity: parseInt(form.quantity) })
            });
            if (r.ok) navigate("/seedbanks/batch-list");
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🌰 Add Seed Batch</h2><p>Register new seeds into the seed bank</p></div>
                <button className="btn btn-outline-light" onClick={() => navigate("/seedbanks/batch-list")}>← Back</button>
            </div>
            <div className="glass-panel" style={{maxWidth:"700px"}}>
                <form onSubmit={handleSave}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Strain *</label>
                            {!customStrain ? (
                                <select className="form-select" value={form.strain} onChange={e => {
                                    if (e.target.value === "Custom") { setCustomStrain(true); setForm({...form,strain:""}); }
                                    else setForm({...form,strain:e.target.value});
                                }}>
                                    <option value="">-- Select Strain --</option>
                                    {SEED_STRAINS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            ) : (
                                <div className="d-flex gap-2">
                                    <input className="form-control flex-grow-1" placeholder="Enter strain name..." value={form.strain} onChange={e => setForm({...form,strain:e.target.value})} />
                                    <button type="button" className="btn btn-outline-light btn-sm" onClick={() => { setCustomStrain(false); setForm({...form,strain:""}); }}>↩</button>
                                </div>
                            )}
                        </div>
                        <div className="col-md-6"><label className="form-label">Batch Number</label><input className="form-control" placeholder="Auto-generated if blank" value={form.batch_number} onChange={e => setForm({...form,batch_number:e.target.value})} /></div>
                        <div className="col-md-6"><label className="form-label">Quantity (seeds) *</label><input className="form-control" type="number" value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})} /></div>
                        <div className="col-md-6">
                            <label className="form-label">Storage Location</label>
                            <select className="form-select" value={form.storage_location} onChange={e => setForm({...form,storage_location:e.target.value})}>
                                <option value="">-- Select Location --</option>
                                {STORAGE_LOCS.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6"><label className="form-label">Expiration Date</label><input className="form-control" type="date" value={form.expiration_date} onChange={e => setForm({...form,expiration_date:e.target.value})} /></div>
                        <div className="col-md-6"><label className="form-label">Germination Rate (%)</label><input className="form-control" type="number" min="0" max="100" value={form.germination_rate} onChange={e => setForm({...form,germination_rate:e.target.value})} /></div>
                        <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="3" placeholder="Seed source, breeder, storage conditions..." value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} /></div>
                        <div className="col-12 d-flex gap-2">
                            <button type="button" className="btn btn-outline-light" onClick={() => navigate("/seedbanks/batch-list")}>Cancel</button>
                            <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>
                                {saving ? <span className="spinner-border spinner-border-sm" /> : "🌰 Add to Seed Bank"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddSeedBatch;
