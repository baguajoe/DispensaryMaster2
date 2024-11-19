import React, { useState } from "react";
import axios from "axios";

const SupportForm = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/support/tickets", formData);
      alert("Support ticket submitted successfully! Someone will get back to you within 24 hours.");
      setFormData({ subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      alert("Failed to submit the ticket. Please try again.");
    }
  };

  return (
    <div>
      <h1>Contact Tech Support</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Subject</label>
          <input
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SupportForm;
