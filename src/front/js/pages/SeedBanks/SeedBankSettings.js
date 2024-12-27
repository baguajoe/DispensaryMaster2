import React, { useState } from 'react';

const SeedBankSettings = () => {
    const [settings, setSettings] = useState({
        alertThreshold: 10,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const handleSave = () => {
        console.log('Settings Saved:', settings);
    };

    return (
        <div>
            <h2>Seed Bank Settings</h2>
            <label>Alert Threshold:</label>
            <input
                type="number"
                name="alertThreshold"
                value={settings.alertThreshold}
                onChange={handleChange}
            />
            <button onClick={handleSave}>Save Settings</button>
        </div>
    );
};

export default SeedBankSettings;
