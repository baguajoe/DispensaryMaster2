import React, { useState } from "react";
const SeedResourceManagement = () => {
    const [resources] = useState([
        {name:"Propagation Trays",quantity:50,unit:"trays",status:"Available"},
        {name:"Rockwool Cubes",quantity:200,unit:"cubes",status:"Available"},
        {name:"pH Meter",quantity:3,unit:"units",status:"Available"},
        {name:"Grow Lights (seedling)",quantity:8,unit:"units",status:"In Use"},
        {name:"Humidifier",quantity:2,unit:"units",status:"Available"},
    ]);
    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🔧 Seed Resource Management</h2></div>
            <div className="glass-panel">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}><th>Resource</th><th>Quantity</th><th>Unit</th><th>Status</th></tr></thead>
                        <tbody>{resources.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.name}</td><td>{r.quantity}</td><td style={{color:"rgba(255,255,255,0.5)"}}>{r.unit}</td><td><span className={`badge bg-${r.status==="Available"?"success":"warning text-dark"}`}>{r.status}</span></td></tr>)}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default SeedResourceManagement;
