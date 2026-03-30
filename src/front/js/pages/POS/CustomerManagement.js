import React, { useEffect, useState } from "react";

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/customers`, { headers });
            if (r.ok) setCustomers(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filtered = customers.filter(c =>
        `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Customer Management</h1>

            <div className="row mb-3">
                <div className="col-md-5">
                    <input className="form-control" placeholder="Search customers..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-2 text-muted d-flex align-items-center">
                    {filtered.length} customers
                </div>
            </div>

            <div className="row">
                <div className={selected ? "col-md-7" : "col-12"}>
                    <div className="card">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-dark">
                                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Membership</th><th>Points</th><th>Status</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm text-success" /></td></tr>
                                    ) : filtered.map(c => (
                                        <tr key={c.id}>
                                            <td><strong>{c.first_name} {c.last_name}</strong></td>
                                            <td className="small">{c.email}</td>
                                            <td className="small">{c.phone}</td>
                                            <td>
                                                <span className={`badge ${c.membership_level === "gold" ? "bg-warning text-dark" : c.membership_level === "premium" ? "bg-info" : "bg-secondary"}`}>
                                                    {c.membership_level}
                                                </span>
                                            </td>
                                            <td>🏆 {c.loyalty_points || 0}</td>
                                            <td>
                                                <span className={`badge ${c.verification_status === "verified" ? "bg-success" : "bg-warning text-dark"}`}>
                                                    {c.verification_status}
                                                </span>
                                            </td>
                                            <td><button className="btn btn-sm btn-outline-primary" onClick={() => setSelected(c)}>View</button></td>
                                        </tr>
                                    ))}
                                    {!loading && filtered.length === 0 && (
                                        <tr><td colSpan="7" className="text-center py-4 text-muted">No customers found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {selected && (
                    <div className="col-md-5">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between">
                                <h5 className="mb-0">{selected.first_name} {selected.last_name}</h5>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>✕</button>
                            </div>
                            <div className="card-body">
                                <p><strong>Email:</strong> {selected.email}</p>
                                <p><strong>Phone:</strong> {selected.phone}</p>
                                <p><strong>Membership:</strong> <span className={`badge ${selected.membership_level === "gold" ? "bg-warning text-dark" : "bg-secondary"}`}>{selected.membership_level}</span></p>
                                <p><strong>Loyalty Points:</strong> 🏆 {selected.loyalty_points || 0}</p>
                                <p><strong>Status:</strong> <span className={`badge ${selected.verification_status === "verified" ? "bg-success" : "bg-warning text-dark"}`}>{selected.verification_status}</span></p>
                                {selected.date_of_birth && <p><strong>DOB:</strong> {selected.date_of_birth}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerManagement;
