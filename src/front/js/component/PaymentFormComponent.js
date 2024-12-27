import React, { useState } from "react";

const PaymentForm = ({ cart, onCompleteSale }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentDetails = {
      method: paymentMethod,
      amountPaid,
    };
    onCompleteSale(paymentDetails);
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2>Payment</h2>
      <div>
        <label>Payment Method:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile">Mobile Wallet</option>
        </select>
      </div>
      <div>
        <label>Amount Paid:</label>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          required
        />
      </div>
      <button type="submit">Complete Sale</button>
    </form>
  );
};

export default PaymentForm;
