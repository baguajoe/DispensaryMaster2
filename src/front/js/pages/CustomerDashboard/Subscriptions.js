import React, { useState } from "react";

const Subscriptions = () => {
  const [subscription, setSubscription] = useState({
    plan: "Premium",
    nextBillingDate: "2025-02-01",
    price: "$20/month",
  });

  const [billingHistory] = useState([
    { date: "2025-01-01", amount: "$20", status: "Paid" },
    { date: "2024-12-01", amount: "$20", status: "Paid" },
  ]);

  const handleCancel = () => {
    alert("Cancel subscription logic here.");
  };

  const handleUpgradeDowngrade = (newPlan) => {
    alert(`Switching to ${newPlan} plan...`);
    setSubscription({ ...subscription, plan: newPlan });
  };

  return (
    <div>
      <h1>Manage Subscriptions</h1>
      <p>Current Plan: {subscription.plan}</p>
      <p>Price: {subscription.price}</p>
      <p>Next Billing Date: {subscription.nextBillingDate}</p>
      <button onClick={handleCancel}>Cancel Subscription</button>
      <button onClick={() => handleUpgradeDowngrade("Basic")}>Downgrade to Basic</button>
      <button onClick={() => handleUpgradeDowngrade("Pro")}>Upgrade to Pro</button>

      <h2>Billing History</h2>
      <ul>
        {billingHistory.map((item, index) => (
          <li key={index}>
            {item.date} - {item.amount} - {item.status}
          </li>
        ))}
      </ul>
      <p>Reminders: Your next renewal is on {subscription.nextBillingDate}.</p>
    </div>
  );
};

export default Subscriptions;
