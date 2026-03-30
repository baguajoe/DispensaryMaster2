import React, { useState, useEffect } from "react";

const ROLES = ["admin", "owner", "manager", "employee", "customer"];

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({ email:"", password:"", role:"employee" });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/users`, { headers });
            if (r.ok) setUsers(await r.json());
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editUser
                ? `${process.env.BACKEND_URL}/api/users/${editUser.id}`
                : `${process.env.BACKEND_URL}/api/signup`;
            const method = editUser ? "PUT" : "POST";
            const r = await fetch(url, { method, headers, body: JSON.stringify(formData) });
            if (r.ok) {
                await fetchUsers();
                setShowModal(false);
                setEditUser(null);
                setFormData({ email:"", password:"", role:"employee" });
            } else {
                const d = await r.json();
                alert(d.error || d.msg || "Failed to save user");
            }
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/users/${id}`, { method:"DELETE", headers });
            if (r.ok) fetchUsers();
        } catch(e) { console.error(e); }
    };

    const openEdit = (user) => {
        setEditUser(user);
        setFormData({ email:user.email, password:"", role:user.role || "employee" });
        setShowModal(true);
    };

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>Users</h2>
                    <p>Manage dispensary staff accounts</p>
                </div>
                <button className="btn btn-success" onClick={() => { setEditUser(null); setFormData({ email:"", password:"", role:"employee" }); setShowModal(true); }}>
                    + Add User
                </button>
            </div>

            <div className="glass-panel mb-3">
                <input className="form-control" placeholder="Search by email or role..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-panel">
                {loading ? (
                    <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No users found</div>
                ) : (
                    <table className="table mb-0">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id}>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${u.role === "admin" || u.role === "owner" ? "bg-danger" : u.role === "manager" ? "bg-warning text-dark" : "bg-secondary"}`}>{u.role}</span></td>
                                    <td><span className={`badge ${u.is_active ? "bg-success" : "bg-secondary"}`}>{u.is_active ? "Active" : "Inactive"}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-light me-1" onClick={() => openEdit(u)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editUser ? "Edit User" : "Add User"}</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input className="form-control" type="email" value={formData.email}
                                            onChange={e => setFormData({...formData, email:e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password {editUser && "(leave blank to keep current)"}</label>
                                        <input className="form-control" type="password" value={formData.password}
                                            onChange={e => setFormData({...formData, password:e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Role</label>
                                        <select className="form-select" value={formData.role}
                                            onChange={e => setFormData({...formData, role:e.target.value})}>
                                            {ROLES.map(r => <option key={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                                        {saving ? <span className="spinner-border spinner-border-sm" /> : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />
                </>
            )}
        </div>
    );
};
export default Users;
