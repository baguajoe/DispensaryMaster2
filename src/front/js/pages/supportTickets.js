import React from "react";
import TicketForm from "../components/support/TicketForm"; // Import reusable component

const SupportForm = () => {
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Your support ticket has been submitted! We will get back to you within 24 hours.");
      } else {
        alert("There was an error submitting your ticket. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit the ticket.");
    }
  };

  return (
    <div>
      <h1>Submit a Support Ticket</h1>
      <TicketForm onSubmit={handleSubmit} /> {/* Reusable form component */}
    </div>
  );
};

export default SupportForm;
