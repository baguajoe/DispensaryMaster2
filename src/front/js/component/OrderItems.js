// OrdersPage.js
import React, { useState } from "react";

const OrdersPage = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);

  return (
    <div>
      <div className="tab-navigation">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            className={activeTab === tabKey ? "active" : ""}
            onClick={() => setActiveTab(tabKey)}
          >
            {tabKey}
          </button>
        ))}
      </div>
      <div className="tab-content">{tabs[activeTab]}</div>
    </div>
  );
};

export default OrdersPage;
