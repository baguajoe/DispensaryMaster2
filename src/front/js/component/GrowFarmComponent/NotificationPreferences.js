import React, { useState } from "react";

const NotificationPreferences = ({ preferences, onSave }) => {
  const [prefs, setPrefs] = useState(preferences);

  const handleChange = (key) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const handleSave = () => {
    onSave(prefs);
  };

  return (
    <div className="notification-preferences">
      <h3>Notification Preferences</h3>
      <div>
        <label>
          <input
            type="checkbox"
            checked={prefs.email}
            onChange={() => handleChange("email")}
          />
          Email Notifications
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={prefs.sms}
            onChange={() => handleChange("sms")}
          />
          SMS Notifications
        </label>
      </div>
      <button onClick={handleSave}>Save Preferences</button>
    </div>
  );
};

export default NotificationPreferences;
