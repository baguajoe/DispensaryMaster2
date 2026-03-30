import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Companies = () => {
    const { store, actions } = useContext(Context);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => { actions.fetchCompanies(); actions.fetchJobs(); }, []);

    const filtered = (store.companies||[]).filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );
    const getJobCount = (id) => (store.jobs||[]).filter(j => j.company_id === id).length;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">🏢 Cannabis Companies</h1>
                <button className="btn btn-success" onClick={() => navigate("/jobs/post")}>+ Register Your Dispensary</button>
            </div>
            <input className="form-control mb-4" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
            {filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <div style={{fontSize:"3rem"}}>🏢</div>
                    <h4>No companies yet</h4>
                    <button className="btn btn-success" onClick={() => navigate("/jobs/post")}>Register Now</button>
                </div>
            ) : (
                <div className="row g-3">
                    {filtered.map(c => (
                        <div key={c.id} className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5>{c.name}</h5>
                                    <p className="text-muted small">{c.description || "Cannabis company"}</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span className="badge bg-success">{getJobCount(c.id)} open positions</span>
                                        <button className="btn btn-sm btn-outline-success" onClick={() => navigate("/jobs")}>View Jobs</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Companies;
