import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
const ResourceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/medical-resources/${id}`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(data => { setResource(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);
    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;
    if (!resource) return <div className="main-content p-4"><div className="glass-panel text-center py-5"><h5>Resource not found</h5><button className="btn btn-outline-light mt-3" onClick={()=>navigate(-1)}>← Back</button></div></div>;
    return (
        <div className="main-content p-4">
            <button className="btn btn-outline-light mb-4" onClick={()=>navigate(-1)}>← Back</button>
            <div className="glass-panel">
                <h2 className="mb-2">{resource.title || resource.name}</h2>
                <p style={{color:"rgba(255,255,255,0.6)"}}>{resource.description}</p>
                {resource.content && <div className="mt-3" style={{lineHeight:"1.8"}}>{resource.content}</div>}
                {resource.url && <a href={resource.url} target="_blank" rel="noreferrer" className="btn btn-success mt-3">View Resource →</a>}
            </div>
        </div>
    );
};
export default ResourceDetailPage;
