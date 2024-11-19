import React from "react";

const TicketDetails = ({ ticket }) => {
  if (!ticket) return <p>No ticket selected</p>;

  return (
    <div>
      <h2>{ticket.subject}</h2>
      <p>Status: {ticket.status}</p>
      <p>Created At: {new Date(ticket.created_at).toLocaleString()}</p>
      <p>{ticket.message}</p>
    </div>
  );
};

export default TicketDetails;
