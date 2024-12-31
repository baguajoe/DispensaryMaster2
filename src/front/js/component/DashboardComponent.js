import React from "react";
import MetricCard from "../component/dashboard/MetricCard";
import ChartCard from "../component/dashboard/ChartCard";
import TableCard from "../component/dashboard/TableCard";
import PersonalizedRecommendations from "../component/dashboard/PersonalizedRecommendations";
import SentimentAnalysis from "../component/dashboard/SentimentAnalysis";

const DashboardComponent = ({ 
  metrics, 
  salesPerformance, 
  topCategories, 
  loading, 
  customerReviews, 
  loggedInCustomerId 
}) => {
  return (
    <div className="p-6 bg-gray-100">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            bgColor={metric.bgColor}
            textColor={metric.textColor}
          />
        ))}
      </div>

      {/* Sales Performance Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
        {loading ? (
          <p>Loading chart...</p>
        ) : (
          <ChartCard type="line" data={salesPerformance} title="Sales Over Time" />
        )}
      </div>

      {/* Top Categories Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
        <TableCard
          data={topCategories}
          columns={["Category", "Sales", "Revenue"]}
          keyMapping={{
            Category: "category",
            Sales: "sales",
            Revenue: "revenue",
          }}
        />
      </div>

      {/* Personalized Recommendations */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
        <PersonalizedRecommendations customerId={loggedInCustomerId} />
      </div>

      {/* Customer Reviews */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        <SentimentAnalysis customerReviews={customerReviews} />
      </div>
    </div>
  );
};

export default DashboardComponent;
