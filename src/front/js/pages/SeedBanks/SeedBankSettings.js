import React, { useState } from "react";
const SeedBankSettings = () => {
    const [settings, setSettings] = useState({ storage_temp:"40", storage_humidity:"30", low_stock_alert:"50", notes:"" });
    const [saved, setSaved] = useState(false);
    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>⚙️ Seed Bank Settings</h2></div>
            <div className="glass-panel">
                <div className="row g-3">
                    <div className="col-md-3"><label className="form-label">Storage Temp (°F)</label><input className="form-control" type="number" value={settings.storage_temp} onChange={e=>setSettings({...settings,storage_temp:e.target.value})} /></div>
                    <div className="col-md-3"><label className="form-label">Storage Humidity (%)</label><input className="form-control" type="number" value={settings.storage_humidity} onChange={e=>setSettings({...settings,storage_humidity:e.target.value})} /></div>
                    <div className="col-md-3"><label className="form-label">Low Stock Alert (#)</label><input className="form-control" type="number" value={settings.low_stock_alert} onChange={e=>setSettings({...settings,low_stock_alert:e.target.value})} /></div>
                    <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={settings.notes} onChange={e=>setSettings({...settings,notes:e.target.value})} /></div>
                    <div className="col-12"><button className="btn btn-success" onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}>{saved?"✓ Saved!":"Save Settings"}</button></div>
                </div>
            </div>
        </div>
    );
};
export default SeedBankSettings;
