import React, { useState, useEffect } from "react";

const POSSettings = () => {
    const [settings, setSettings] = useState({
        tax_rate: 8,
        currency: "USD",
        receipt_printer: false,
        barcode_scanner: true,
        loyalty_enabled: true,
        offline_mode: true,
        payment_methods: ["cash", "card", "debit"]
    });
    const [saved, setSaved] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/pos/settings`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setSettings({ ...data, tax_rate: (data.tax_rate || 0.08) * 100 }); })
            .catch(console.error);
    }, []);

    const handleSave = async () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">POS Settings</h1>
            <div className="row justify-content-center">
                <div className="col-md-7">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Tax & Currency</h5>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Tax Rate (%)</label>
                                    <input type="number" className="form-control" value={settings.tax_rate}
                                        onChange={e => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Currency</label>
                                    <select className="form-select" value={settings.currency}
                                        onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                    </select>
                                </div>
                            </div>

                            <h5 className="mb-3">Hardware</h5>
                            {[
                                { key: "receipt_printer", label: "Receipt Printer", desc: "Enable receipt printing" },
                                { key: "barcode_scanner", label: "Barcode Scanner", desc: "Enable barcode scanning" },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                                    <div>
                                        <div className="fw-bold">{label}</div>
                                        <div className="small text-muted">{desc}</div>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={settings[key]}
                                            onChange={e => setSettings({ ...settings, [key]: e.target.checked })} />
                                    </div>
                                </div>
                            ))}

                            <h5 className="mb-3">Features</h5>
                            {[
                                { key: "loyalty_enabled", label: "Loyalty Program", desc: "Track and redeem customer loyalty points" },
                                { key: "offline_mode", label: "Offline Mode", desc: "Save transactions when internet is down" },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                                    <div>
                                        <div className="fw-bold">{label}</div>
                                        <div className="small text-muted">{desc}</div>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" checked={settings[key]}
                                            onChange={e => setSettings({ ...settings, [key]: e.target.checked })} />
                                    </div>
                                </div>
                            ))}

                            <button className="btn btn-success w-100 mt-2" onClick={handleSave}>
                                {saved ? "✓ Saved!" : "Save Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSSettings;
