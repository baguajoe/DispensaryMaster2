import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
const SeedBatchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/seed_batches/${id}`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r=>r.ok?r.json():null).then(d=>{setBatch(d);setLoading(false);}).catch(()=>setLoading(false));
    }, [id]);
    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;
    if (!batch) return <div className="main-content p-4"><div className="glass-panel text-center py-5"><h5>Batch not found</h5><button className="btn btn-outline-light mt-3" onClick={()=>navigate(-1)}>← Back</button></div></div>;
    return (
        <div className="main-content p-4">
            <button className="btn btn-outline-light mb-4" onClick={()=>navigate(-1)}>← Back</button>
            <div className="glass-panel">
                <h2 className="mb-4">{batch.strain_name||`Batch #${batch.id}`}</h2>
                <div className="row g-3">
                    {[{l:"Quantity",v:batch.quantity},{l:"Source",v:batch.source},{l:"Genetics",v:batch.genetics},{l:"Status",v:batch.status},{l:"Acquired",v:batch.acquisition_date},{l:"Notes",v:batch.notes}].filter(f=>f.v).map((f,i)=>(
                        <div key={i} className="col-md-4"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{f.l}</div><div style={{fontWeight:600}}>{f.v}</div></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default SeedBatchDetails;
