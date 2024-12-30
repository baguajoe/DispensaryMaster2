import React, { useState } from "react";
import GridLayout from "react-grid-layout";

const Dashboard = () => {
  const [layout, setLayout] = useState([
    { i: "sales", x: 0, y: 0, w: 4, h: 2 },
    { i: "inventory", x: 4, y: 0, w: 4, h: 2 },
    { i: "compliance", x: 8, y: 0, w: 4, h: 2 },
  ]);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    // Save layout to backend or local storage for persistence
  };

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={handleLayoutChange}
    >
      <div key="sales" className="widget">Sales Widget</div>
      <div key="inventory" className="widget">Inventory Widget</div>
      <div key="compliance" className="widget">Compliance Widget</div>
    </GridLayout>
  );
};

export default Dashboard;
