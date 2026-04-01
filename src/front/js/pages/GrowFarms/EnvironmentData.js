import React, { useState, useEffect } from "react";
const EnvironmentData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ temperature:"", humidity:"", co2_level:"", light_hours:"", notes:"" });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };
    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/environment_data`, { headers })
            .then(r=>r.ok?r.json():[]).then(d=>{setData(Array.isArray(d)?d:[]);setLoading(false);}).catch(()=>setLoading(false));
    };
    useEffect(() => { load(); }, []);
    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        await fetch(`${process.env.BACKEND_URL}/api/environment_data`, { method:"POST", headers, body:JSON.stringify(form) });
        setSaving(false); load();
    };
    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;
    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🌡️ Environment Data</h2><p>Monitor grow room conditions</p></div>
            <div className="glass-panel mb-4">
                <h5 className="mb-3">Log Reading</h5>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-2"><label className="form-label">Temp (°F)</label><input className="form-control" type="number" step="0.1" value={form.temperature} onChange={e=>setForm({...form,temperature:e.target.value})} /></div>
                        <div className="col-md-2"><label className="form-label">Humidity (%)</label><input className="form-control" type="number" step="0.1" value={form.humidity} onChange={e=>setForm({...form,humidity:e.target.value})} /></div>
                        <div className="col-md-2"><label className="form-label">CO2 (ppm)</label><input className="form-control" type="number" value={form.co2_level} onChange={e=>setForm({...form,co2_level:e.target.value})} /></div>
                        <div className="col-md-2"><label className="form-label">Light Hours</label><input className="form-control" type="number" value={form.light_hours} onChange={e=>setForm({...form,light_hours:e.target.value})} /></div>
                        <div className="col-md-4"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
                        <div className="col-12"><button type="submit" className="btn btn-success" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Log Reading"}</button></div>
                    </div>
                </form>
            </div>
            <div className="glass-panel">
                <h5 className="mb-3">Recent Readings</h5>
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem"}}><th>Date</th><th>Temp</th><th>Humidity</th><th>CO2</th><th>Light</th><th>Notes</th></tr></thead>
                        <tbody>{data.slice(0,20).map((d,i)=><tr key={i}><td style={{fontSize:"0.8rem"}}>{d.recorded_at||d.created_at||"—"}</td><td style={{color:"#fb6340"}}>{d.temperature}°F</td><td style={{color:"#11cdef"}}>{d.humidity}%</td><td>{d.co2_level}</td><td>{d.light_hours}h</td><td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{d.notes||"—"}</td></tr>)}</tbody>
                    </table>
                </div>
                {data.length===0&&<div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No readings yet</div>}
            </div>
        </div>
    );
};
export default EnvironmentData;
