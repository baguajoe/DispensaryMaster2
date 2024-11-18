import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PricingComparison = () => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [email, setEmail] = useState('');
  const [userCount, setUserCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(249.99);

  const plans = [
    { 
      name: 'Basic Plan', 
      basePrice: 249.99,
      posLicenses: 2,
      powerBiType: null,
      maxUsers: 0,
      userPrice: 0
    },
    { 
      name: 'Pro Plan', 
      basePrice: 499.99,
      posLicenses: 5,
      powerBiType: 'Pro',
      maxUsers: 10,  // Updated to 10 users
      userPrice: 10
    },
    { 
      name: 'Enterprise Plan', 
      basePrice: 749.99,
      posLicenses: 10,
      powerBiType: 'Premium Per User',
      maxUsers: 20,  // Updated to 20 users
      userPrice: 20
    }
  ];

  const features = [
    {
      category: 'Core Features',
      items: [
        { name: 'Product Management', basic: true, pro: true, enterprise: true },
        { name: 'Customer Management', basic: true, pro: true, enterprise: true },
        { name: 'Order Management', basic: true, pro: true, enterprise: true },
        { name: 'Invoice Management', basic: true, pro: true, enterprise: true }
      ]
    },
    {
      category: 'Power BI Integration',
      items: [
        { name: 'Power BI Pro', basic: false, pro: 'Up to 10 users', enterprise: false },
        { name: 'Power BI Premium Per User', basic: false, pro: false, enterprise: 'Up to 20 users' }
      ]
    },
    {
      category: 'Analytics & AI Features',
      items: [
        { name: 'Sales Analytics', basic: false, pro: true, enterprise: true },
        { name: 'Inventory Analytics', basic: false, pro: true, enterprise: true },
        { name: 'Predictive Inventory Analytics', basic: false, pro: false, enterprise: true },
        { name: 'Sales Prediction', basic: false, pro: false, enterprise: true },
        { name: 'Fraud Detection', basic: false, pro: false, enterprise: true },
        { name: 'Demand Forecasting', basic: false, pro: false, enterprise: true },
        { name: 'AI-Powered POS Recommendations', basic: false, pro: false, enterprise: true },
        { name: 'Campaign Analytics', basic: false, pro: false, enterprise: true }
      ]
    },
    {
      category: 'Admin & User Features',
      items: [
        { name: 'Role Management', basic: false, pro: true, enterprise: true },
        { name: 'Import Inventory', basic: false, pro: true, enterprise: true },
        { name: 'User Settings', basic: true, pro: true, enterprise: true },
        { name: 'Notifications', basic: true, pro: true, enterprise: true },
        { name: 'Admin Dashboard', basic: false, pro: true, enterprise: true }
      ]
    }
  ];

  const chartData = [
    {
      name: 'Basic',
      'Core Features': 4,
      'Analytics & AI': 0,
      'Admin & Support': 2
    },
    {
      name: 'Pro',
      'Core Features': 6,
      'Analytics & AI': 3,
      'Admin & Support': 4
    },
    {
      name: 'Enterprise',
      'Core Features': 9,
      'Analytics & AI': 7,
      'Admin & Support': 8
    }
  ];

  const handlePlanChange = (planName) => {
    const plan = plans.find(p => p.name === planName);
    setSelectedPlan(planName.split(' ')[0].toLowerCase());
    setUserCount(1);
    setTotalPrice(plan.basePrice + plan.userPrice); // Include first user in base price
  };

  const handleUserCountChange = (e) => {
    const plan = plans.find(p => p.name.toLowerCase().startsWith(selectedPlan));
    const count = Math.min(Math.max(1, parseInt(e.target.value) || 1), plan.maxUsers);
    setUserCount(count);
    setTotalPrice(plan.basePrice + (count * plan.userPrice));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    console.log({
      email,
      plan: selectedPlan,
      userCount,
      totalPrice
    });
  };

  const renderCell = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="mx-auto text-green-500" size={20} />
      ) : (
        <X className="mx-auto text-red-500" size={20} />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="space-y-8 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <label className="block">
            <span className="text-gray-700">Email Address</span>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>
        </div>

        <Card className="w-full">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-left"></th>
                    {plans.map(plan => (
                      <th key={plan.name} className="p-4 text-center">
                        <div className="space-y-2">
                          <div className="font-bold text-lg">{plan.name}</div>
                          <div className="text-xl font-bold text-blue-600">
                            ${plan.basePrice.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">/month</div>
                          <div className="text-sm text-gray-600">
                            {plan.posLicenses} POS Licenses
                          </div>
                          {plan.powerBiType && (
                            <div className="text-sm text-gray-600">
                              Power BI {plan.powerBiType}
                              <br />
                              <span className="text-xs">
                                (Up to {plan.maxUsers} users, +${plan.userPrice}/user)
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePlanChange(plan.name)}
                            className={`px-4 py-2 rounded-md ${
                              selectedPlan === plan.name.split(' ')[0].toLowerCase()
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            Select Plan
                          </button>
                          {plan.maxUsers > 0 && selectedPlan === plan.name.split(' ')[0].toLowerCase() && (
                            <div className="mt-4">
                              <label className="block text-sm">
                                Power BI Users
                                <input
                                  type="number"
                                  value={userCount}
                                  onChange={handleUserCountChange}
                                  min="1"
                                  max={plan.maxUsers}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                                <span className="text-xs text-gray-500">
                                  +${plan.userPrice}/user
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((category, categoryIndex) => (
                    <React.Fragment key={category.category}>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="p-4 font-bold text-lg">
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((feature, featureIndex) => (
                        <tr key={`${categoryIndex}-${featureIndex}`} 
                            className="border-b border-gray-200">
                          <td className="p-4 text-left">{feature.name}</td>
                          <td className="p-4 text-center">{renderCell(feature.basic)}</td>
                          <td className="p-4 text-center">{renderCell(feature.pro)}</td>
                          <td className="p-4 text-center">{renderCell(feature.enterprise)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="text-2xl font-bold mb-4">
            Total Price: ${totalPrice.toFixed(2)}/month
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Subscribe Now
          </button>
        </div>
      </form>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Features Comparison</h2>
          <div className="h-80">
            <LineChart
              width={800}
              height={300}
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Core Features" stroke="#8884d8" />
              <Line type="monotone" dataKey="Analytics & AI" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Admin & Support" stroke="#ffc658" />
            </LineChart>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingComparison;