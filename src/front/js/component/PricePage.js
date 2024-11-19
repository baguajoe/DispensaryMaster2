import React from "react";

const plans = [
  {
    name: "Basic Plan",
    price: "$10/month",
    features: ["Feature A", "Feature B", "Limited Support"],
    id: "basic",
  },
  {
    name: "Pro Plan",
    price: "$30/month",
    features: ["Feature A", "Feature B", "Feature C", "Priority Support"],
    id: "pro",
  },
  {
    name: "Enterprise Plan",
    price: "$50/month",
    features: [
      "Feature A",
      "Feature B",
      "Feature C",
      "Feature D",
      "Dedicated Support",
    ],
    id: "enterprise",
  },
];

const Pricing = () => {
  const handleSubscribe = (planId) => {
    alert(`You selected the ${planId} plan.`);
    // Add logic to navigate or integrate subscription handling
  };

  return (
    <div>
      <h1>Choose Your Plan</h1>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h2>{plan.name}</h2>
            <p style={{ fontSize: "1.5em", fontWeight: "bold" }}>
              {plan.price}
            </p>
            <ul style={{ textAlign: "left" }}>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe(plan.id)}>
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
