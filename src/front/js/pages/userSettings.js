import React, { useState, useEffect } from "react";
import axios from "axios";

const UserSettings = () => {
  const [settings, setSettings] = useState({
    email: "",
    password: "",
    preferences: {},
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/api/users/settings");
        setSettings(response.data);
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/users/settings", settings);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error updating settings.");
    }
  };

  return (
    <div>
      <h1>User Settings</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={settings.email}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="New Password"
          onChange={handleChange}
        />
        <textarea
          name="preferences"
          placeholder="Preferences (JSON format)"
          value={JSON.stringify(settings.preferences)}
          onChange={handleChange}
        />
        <button type="submit">Update Settings</button>
      </form>
    </div>
  );
};

export default UserSettings;
