import React, { useState, useEffect } from "react";
import NotificationPreferences from "../../component/GrowFarmComponent/NotificationPreferences";
// import { fetchSettings, updateSettings } from "../services/settingsService";

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const data = await fetchSettings();
                // setSettings(data);
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleUpdateSettings = async (newSettings) => {
        try {
            // const updatedSettings = await updateSettings(newSettings);
            // setSettings(updatedSettings);
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    };

    return (
        <div>
            <h1>Settings</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <NotificationPreferences
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                />
            )}
        </div>
    );
};

export default Settings;
