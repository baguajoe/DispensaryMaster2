import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const StaffTraining = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/training-resources`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setResources(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);
    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;
    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📚 Medical Staff Training</h2><p>{resources.length} training resources</p></div>
                <button className="btn btn-success" onClick={()=>navigate("/training")}>Go to Training Center →</button>
            </div>
            <div className="row g-3">
                {resources.length === 0 ? (
                    <div className="col-12"><div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>📚</div>
                        <h5>No training resources yet</h5>
                        <button className="btn btn-success mt-3" onClick={()=>navigate("/training/create")}>Create First Training</button>
                    </div></div>
                ) : resources.map((r,i) => (
                    <div key={i} className="col-md-6 col-lg-4">
                        <div className="glass-panel h-100">
                            <h5>{r.title||r.name}</h5>
                            <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)"}}>{r.description}</p>
                            <button className="btn btn-outline-light btn-sm" onClick={()=>navigate(`/medical/resources/${r.id}`)}>View →</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default StaffTraining;
