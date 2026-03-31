import React, { useState } from "react";
const GrowFarmSettings = () => {
    const [settings, setSettings] = useState({ default_strain:"", target_temp:"75", target_humidity:"55", co2_target:"1200", light_schedule:"18/6", alert_email:"", auto_alerts:true });
    const [saved, setSaved] = useState(false);
    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>⚙️ Grow Farm Settings</h2></div>
            <div className="glass-panel">
                <div className="row g-3">
                    <div className="col-md-4"><label className="form-label">Default Strain</label><input className="form-control" value={settings.default_strain} onChange={e=>setSettings({...settings,default_strain:e.target.value})} /></div>
                    <div className="col-md-2"><label className="form-label">Target Temp (°F)</label><input className="form-control" type="number" value={settings.target_temp} onChange={e=>setSettings({...settings,target_temp:e.target.value})} /></div>
                    <div className="col-md-2"><label className="form-label">Humidity (%)</label><input className="form-control" type="number" value={settings.target_humidity} onChange={e=>setSettings({...settings,target_humidity:e.target.value})} /></div>
                    <div className="col-md-2"><label className="form-label">CO2 Target</label><input className="form-control" type="number" value={settings.co2_target} onChange={e=>setSettings({...settings,co2_target:e.target.value})} /></div>
                    <div className="col-md-2"><label className="form-label">Light Schedule</label><select className="form-select" value={settings.light_schedule} onChange={e=>setSettings({...settings,light_schedule:e.target.value})}><option>18/6</option><option>20/4</option><option>16/8</option><option>12/12</option></select></div>
                    <div className="col-md-6"><label className="form-label">Alert Email</label><input className="form-control" type="email" value={settings.alert_email} onChange={e=>setSettings({...settings,alert_email:e.target.value})} /></div>
                    <div className="col-md-6 d-flex align-items-end"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={settings.auto_alerts} onChange={e=>setSettings({...settings,auto_alerts:e.target.checked})} /><label className="form-check-label">Enable Auto Alerts</label></div></div>
                    <div className="col-12"><button className="btn btn-success" onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}>{saved?"✓ Saved!":"Save Settings"}</button></div>
                </div>
            </div>
        </div>
    );
};
export default GrowFarmSettings;
