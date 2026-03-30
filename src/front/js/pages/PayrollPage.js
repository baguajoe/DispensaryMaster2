import React, { useState, useEffect } from "react";

const PayrollPage = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        employee_id:"", pay_period_start:"", pay_period_end:"",
        total_hours:"", hourly_rate:""
    });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/payroll/summary`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/employees`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([summaryData, empData]) => {
            if (summaryData) {
                setSummary(summaryData);
                setPayrolls(summaryData.payrolls || []);
            }
            setEmployees(Array.isArray(empData) ? empData : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/payroll`, {
                method:"POST", headers, body:JSON.stringify(form)
            });
            if (r.ok) { load(); setShowForm(false); setForm({ employee_id:"", pay_period_start:"", pay_period_end:"", total_hours:"", hourly_rate:"" }); }
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this payroll record?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/payroll/${id}`, { method:"DELETE", headers });
        load();
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>💰 Payroll</h2><p>{payrolls.length} payroll records</p></div>
                <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>+ Add Payroll</button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="row g-3 mb-4">
                    {[
                        {l:"Total Paid Out", v:`$${summary.total_paid?.toLocaleString()}`, c:"#2dce89"},
                        {l:"Total Hours", v:`${summary.total_hours}h`, c:"#11cdef"},
                        {l:"Employees Paid", v:summary.employees_paid, c:"#ffd600"},
                        {l:"Total Records", v:summary.total_records, c:"#fb6340"},
                    ].map((s,i) => (
                        <div key={i} className="col-6 col-md-3">
                            <div className="glass-panel text-center">
                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                                <div style={{fontSize:"1.8rem",fontWeight:700,color:s.c,marginTop:"4px"}}>{s.v}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">New Payroll Record</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Employee *</label>
                                <select className="form-select" required value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})}>
                                    <option value="">Select employee...</option>
                                    {employees.map(e=><option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Pay Period Start</label>
                                <input className="form-control" type="date" required value={form.pay_period_start} onChange={e=>setForm({...form,pay_period_start:e.target.value})} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Pay Period End</label>
                                <input className="form-control" type="date" required value={form.pay_period_end} onChange={e=>setForm({...form,pay_period_end:e.target.value})} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Total Hours</label>
                                <input className="form-control" type="number" step="0.5" required value={form.total_hours} onChange={e=>setForm({...form,total_hours:e.target.value})} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Hourly Rate ($)</label>
                                <input className="form-control" type="number" step="0.01" required value={form.hourly_rate} onChange={e=>setForm({...form,hourly_rate:e.target.value})} />
                            </div>
                            {form.total_hours && form.hourly_rate && (
                                <div className="col-12">
                                    <div className="alert alert-success py-2 mb-0">
                                        Calculated Pay: <strong>${(parseFloat(form.total_hours) * parseFloat(form.hourly_rate)).toFixed(2)}</strong>
                                    </div>
                                </div>
                            )}
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>
                                    {saving?<span className="spinner-border spinner-border-sm"/>:"Save Payroll Record"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Payroll Table */}
            <div className="glass-panel">
                <h5 className="mb-3">Payroll Records</h5>
                {payrolls.length === 0 ? (
                    <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>💰</div>
                        <p>No payroll records yet. Add your first one above.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead>
                                <tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                                    <th>Employee</th>
                                    <th>Pay Period</th>
                                    <th>Hours</th>
                                    <th>Rate</th>
                                    <th>Total Pay</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrolls.map(p => {
                                    const emp = employees.find(e => e.id === p.employee_id);
                                    return (
                                        <tr key={p.id}>
                                            <td>{emp?.name || `Employee #${p.employee_id}`}</td>
                                            <td style={{fontSize:"0.85rem"}}>{p.pay_period_start} → {p.pay_period_end}</td>
                                            <td>{p.total_hours}h</td>
                                            <td>${p.hourly_rate}/hr</td>
                                            <td style={{color:"#2dce89",fontWeight:700}}>${p.total_pay?.toFixed(2)}</td>
                                            <td>
                                                <button className="btn btn-outline-danger btn-sm" onClick={()=>handleDelete(p.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{fontWeight:700,borderTop:"2px solid rgba(255,255,255,0.2)"}}>
                                    <td colSpan="4" style={{color:"rgba(255,255,255,0.7)"}}>Total</td>
                                    <td style={{color:"#2dce89"}}>${payrolls.reduce((s,p)=>s+(p.total_pay||0),0).toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default PayrollPage;
