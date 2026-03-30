import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
    pending: "warning",
    reviewed: "info",
    interview: "primary",
    offered: "success",
    rejected: "danger"
};

const JobApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/my-applications`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setApplications(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"50vh"}}>
            <div className="spinner-border text-light" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="text-white mb-0">My Applications</h3>
                    <small style={{color:"rgba(255,255,255,0.5)"}}>Track your cannabis industry job applications</small>
                </div>
                <button className="btn btn-success" onClick={() => navigate("/jobs")}>Browse Jobs</button>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>📋</div>
                    <h5 className="text-white mt-3">No applications yet</h5>
                    <p>Start applying to cannabis industry positions</p>
                    <button className="btn btn-success mt-2" onClick={() => navigate("/jobs")}>Browse Jobs</button>
                </div>
            ) : (
                <div className="rounded-3 overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.12)"}}>
                    <table className="table mb-0" style={{color:"white"}}>
                        <thead style={{background:"rgba(255,255,255,0.08)"}}>
                            <tr>
                                <th className="border-0 py-3">Position</th>
                                <th className="border-0 py-3">Company</th>
                                <th className="border-0 py-3">Location</th>
                                <th className="border-0 py-3">Salary</th>
                                <th className="border-0 py-3">Applied</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, i) => (
                                <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                                    <td className="border-0 py-3">
                                        <strong>{app.job_title}</strong>
                                    </td>
                                    <td className="border-0 py-3" style={{color:"rgba(255,255,255,0.7)"}}>{app.company_name}</td>
                                    <td className="border-0 py-3" style={{color:"rgba(255,255,255,0.7)"}}>{app.location || "—"}</td>
                                    <td className="border-0 py-3" style={{color:"rgba(255,255,255,0.7)"}}>{app.salary || "—"}</td>
                                    <td className="border-0 py-3 small" style={{color:"rgba(255,255,255,0.5)"}}>
                                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}
                                    </td>
                                    <td className="border-0 py-3">
                                        <span className={`badge bg-${STATUS_COLORS[app.status] || "secondary"} text-capitalize`}>
                                            {app.status || "pending"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default JobApplications;
