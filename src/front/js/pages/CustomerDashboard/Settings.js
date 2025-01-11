import React, { useState } from "react";

const Settings = () => {
  const [theme, setTheme] = useState("Light");
  const [language, setLanguage] = useState("English");

  const [security] = useState({
    twoFAEnabled: false,
    loginHistory: [
      { date: "2025-01-01", location: "Boston, MA" },
      { date: "2024-12-30", location: "Cambridge, MA" },
    ],
  });

  const toggleTheme = () => {
    setTheme(theme === "Light" ? "Dark" : "Light");
  };

  const toggleTwoFA = () => {
    alert("Toggle 2FA logic here.");
  };

  return (
    <div>
      <h1>Settings</h1>
      <h2>Theme</h2>
      <p>Current Theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>

      <h2>Language Preferences</h2>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="English">English</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
      </select>

      <h2>Security</h2>
      <p>Two-Factor Authentication: {security.twoFAEnabled ? "Enabled" : "Disabled"}</p>
      <button onClick={toggleTwoFA}>
        {security.twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
      </button>
      <h3>Login Activity</h3>
      <ul>
        {security.loginHistory.map((entry, index) => (
          <li key={index}>
            {entry.date} - {entry.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Settings;
