import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const SubscriptionPage = () => {
  const [plan, setPlan] = useState("basic"); // Default plan
  const [email, setEmail] = useState(""); // User email input
  const [userCount, setUserCount] = useState(1); // Default to 1 user for Power BI
  const [totalPrice, setTotalPrice] = useState(249.99); // Default price for Basic Plan

  const handlePlanChange = (e) => {
    setPlan(e.target.value);
    setUserCount(1); // Reset user count to 1 when switching plans
    if (e.target.value === "basic") {
      setTotalPrice(249.99);
    } else if (e.target.value === "pro") {
      setTotalPrice(499.99);
    } else if (e.target.value === "enterprise") {
      setTotalPrice(749.99);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleUserCountChange = (e) => {
    const count = e.target.value;
    setUserCount(count);

    // Adjust the price based on Power BI users
    if (plan === "pro") {
      setTotalPrice(499.99 + count * 10); // $10 per user for Pro Plan
    } else if (plan === "enterprise") {
      setTotalPrice(749.99 + count * 20); // $20 per user for Enterprise Plan
    }
  };

  const handleSubscription = () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    axios
      .post("/api/powerbi/subscribe", {
        email: email,
        plan: plan,
        planPrice: totalPrice,
        userCount: userCount,
      })
      .then((response) => {
        alert(response.data.message); // Handle success
      })
      .catch((error) => {
        console.error("Error subscribing:", error);
        alert("Error subscribing, please try again.");
      });
  };

  // Chart Data for the features per plan
  const chartData = {
    labels: ["Basic", "Pro", "Enterprise"],
    datasets: [
      {
        label: "Core Features",
        data: [4, 6, 9], // Number of core features for each plan
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Analytics & AI Features",
        data: [0, 3, 7], // Number of Analytics & AI features for each plan
        fill: false,
        borderColor: "rgb(153, 102, 255)",
        tension: 0.1,
      },
      {
        label: "Admin & Support Features",
        data: [2, 4, 8], // Number of Admin & Support features for each plan
        fill: false,
        borderColor: "rgb(255, 159, 64)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h1>Choose Your Plan</h1>

      {/* Email Input */}
      <div>
        <label>
          Email Address:
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            required
          />
        </label>
      </div>

      {/* Plan Options */}
      <div>
        <label>
          Basic Plan ($249.99/month) - 2 POS Licenses (No Power BI)
          <input
            type="radio"
            value="basic"
            checked={plan === "basic"}
            onChange={handlePlanChange}
          />
        </label>
        <ul>
          <li>Product Management</li>
          <li>Customer Management</li>
          <li>Order Management</li>
          <li>Invoice Management</li>
          <li>No Compliance Reports</li>
          <li>No Analytics or AI features</li>
          <li>No Power BI Integration</li>
        </ul>
      </div>

      <div>
        <label>
          Pro Plan ($499.99/month) - 5 POS Licenses (Power BI Pro Included)
          <input
            type="radio"
            value="pro"
            checked={plan === "pro"}
            onChange={handlePlanChange}
          />
        </label>
        <ul>
          <li>Product Management</li>
          <li>Customer Management</li>
          <li>Order Management</li>
          <li>Invoice Management</li>
          <li>Compliance Reports</li>
          <li>Sales Analytics</li>
          <li>Inventory Analytics</li>
          <li>No Predictive Analytics, Sales Prediction, or Fraud Detection</li>
          <li>Role Management</li>
          <li>Import Inventory</li>
          <li>User Settings & Notifications</li>
          <li>Email Support</li>
          <li>Limited API Access</li>
          <li>No POS System Integration</li>
          <li>Power BI Pro Integration</li>
        </ul>
        {/* Power BI User Count */}
        <div>
          <label>
            Number of Power BI Users (Add $10 per user)
            <input
              type="number"
              value={userCount}
              onChange={handleUserCountChange}
              min="1"
              max="10"
            />
          </label>
        </div>
      </div>

      <div>
        <label>
          Enterprise Plan ($749.99/month) - 10 POS Licenses (Power BI Premium Per User Included)
          <input
            type="radio"
            value="enterprise"
            checked={plan === "enterprise"}
            onChange={handlePlanChange}
          />
        </label>
        <ul>
          <li>Product Management</li>
          <li>Customer Management</li>
          <li>Order Management</li>
          <li>Invoice Management</li>
          <li>Compliance Reports</li>
          <li>Sales Analytics</li>
          <li>Inventory Analytics</li>
          <li>Predictive Inventory Analytics</li>
          <li>Sales Prediction</li>
          <li>Fraud Detection</li>
          <li>Demand Forecasting</li>
          <li>AI-Powered POS Recommendations</li>
          <li>Campaign Analytics</li>
          <li>Role Management</li>
          <li>Import Inventory</li>
          <li>User Settings & Notifications</li>
          <li>Priority Support</li>
          <li>Full API Access</li>
          <li>POS System Integration</li>
          <li>Plan Customization Options</li>
          <li>Advanced Compliance Alerts</li>
          <li>Power BI Premium Per User Integration (Up to 15 users)</li>
        </ul>
        {/* Power BI User Count */}
        <div>
          <label>
            Number of Power BI Users (Add $20 per user)
            <input
              type="number"
              value={userCount}
              onChange={handleUserCountChange}
              min="1"
              max="15"
            />
          </label>
        </div>
      </div>

      {/* Subscribe Button */}
      <button onClick={handleSubscription}>Subscribe</button>

      {/* Chart for Plan Features */}
      <div>
        <h2>Plan Features Comparison</h2>
        <Line data={chartData} />
      </div>

      {/* Total Price */}
      <div>
        <h3>Total Price: ${totalPrice}</h3>
      </div>
    </div>
  );
};

export default SubscriptionPage;
