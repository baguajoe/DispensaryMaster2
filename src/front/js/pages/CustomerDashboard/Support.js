import React, { useState } from "react";

const Support = () => {
  const [tickets, setTickets] = useState([
    { id: 1, subject: "Issue with Order #123", status: "Open" },
    { id: 2, subject: "Payment Issue", status: "Resolved" },
  ]);

  const [faq] = useState([
    { question: "How do I track my order?", answer: "Go to the Order History page to track your order." },
    { question: "How can I change my password?", answer: "Visit the Settings page to change your password." },
  ]);

  const openLiveChat = () => {
    alert("Launching live chat...");
  };

  return (
    <div>
      <h1>Support</h1>
      <h2>Support Tickets</h2>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            {ticket.subject} - Status: {ticket.status}
          </li>
        ))}
      </ul>
      <button onClick={() => alert("Submit a new ticket!")}>Submit New Ticket</button>
      <h2>FAQ</h2>
      <ul>
        {faq.map((item, index) => (
          <li key={index}>
            <strong>{item.question}</strong>
            <p>{item.answer}</p>
          </li>
        ))}
      </ul>
      <button onClick={openLiveChat}>Start Live Chat</button>
    </div>
  );
};

export default Support;
