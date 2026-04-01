import React, { useState, useEffect } from "react";

const EmployeeShifts = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clocking, setClocking] = useState(false);
    const [currentShift, setCurrentShift] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/shifts/my`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const shiftList = Array.isArray(data) ? data : [];
                setShifts(shiftList);
                setCurrentShift(shiftList.find(s => s.shift_status === "clocked_in") || null);
                setLoading(false);
            }).catch(() => setLoading(false));
    }, []);

    const handleClockIn = async () => {
        setClocking(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/shifts/clock-in`, { method:"POST", headers, body:JSON.stringify({}) });
            if (r.ok) { const data = await r.json(); setCurrentShift(data); setShifts(prev => [data, ...prev]); }
        } catch(e) { console.error(e); } finally { setClocking(false); }
    };

    const handleClockOut = async () => {
        if (!currentShift) return;
        setClocking(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/shifts/${currentShift.id}/clock-out`, { method:"PUT", headers, body:JSON.stringify({}) });
            if (r.ok) {
                const data = await r.json();
                setCurrentShift(null);
                setShifts(prev => prev.map(s => s.id === data.id ? data : s));
            }
        } catch(e) { console.error(e); } finally { setClocking(false); }
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    const totalHours = shifts.reduce((s, sh) => s + (sh.total_hours || 0), 0);

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>⏰ My Shifts</h2><p>{shifts.length} shifts · {totalHours.toFixed(1)} total hours</p></div>

            <div className="glass-panel mb-4 text-center" style={{padding:"2rem"}}>
                {currentShift ? (
                    <div>
                        <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>🟢</div>
                        <h4 style={{color:"#2dce89"}}>Currently Clocked In</h4>
                        <p style={{color:"rgba(255,255,255,0.6)"}}>Since {currentShift.clock_in_time ? new Date(currentShift.clock_in_time).toLocaleTimeString() : "Unknown"}</p>
                        <button className="btn btn-danger btn-lg px-5" disabled={clocking} onClick={handleClockOut}>
                            {clocking?<span className="spinner-border spinner-border-sm me-2"/>:""}Clock Out
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>⭕</div>
                        <h4 style={{color:"rgba(255,255,255,0.6)"}}>Not Clocked In</h4>
                        <button className="btn btn-success btn-lg px-5" disabled={clocking} onClick={handleClockIn}>
                            {clocking?<span className="spinner-border spinner-border-sm me-2"/>:""}Clock In
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-panel">
                <h5 className="mb-3">Shift History</h5>
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                            <th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th>
                        </tr></thead>
                        <tbody>
                            {shifts.map(s => (
                                <tr key={s.id}>
                                    <td>{s.clock_in_time ? new Date(s.clock_in_time).toLocaleDateString() : "-"}</td>
                                    <td>{s.clock_in_time ? new Date(s.clock_in_time).toLocaleTimeString() : "-"}</td>
                                    <td>{s.clock_out_time ? new Date(s.clock_out_time).toLocaleTimeString() : "-"}</td>
                                    <td style={{color:"#2dce89",fontWeight:700}}>{s.total_hours ? `${s.total_hours}h` : "-"}</td>
                                    <td><span className={`badge bg-${s.shift_status==="clocked_in"?"success":"secondary"}`}>{s.shift_status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default EmployeeShifts;
