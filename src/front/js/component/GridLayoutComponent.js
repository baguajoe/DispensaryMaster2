import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import ComplianceWidget from "./Widgets/ComplianceWidget";
import InventoryWidget from "./Widgets/InventoryWidget";
import SalesWidget from "./Widgets/SalesWidget";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../../styles/gridlayout.css"; // Your custom styles

const GridLayoutComponent = () => {
  const [layout, setLayout] = useState([
    { i: "sales", x: 0, y: 0, w: 4, h: 2 },
    { i: "inventory", x: 4, y: 0, w: 4, h: 2 },
    { i: "compliance", x: 8, y: 0, w: 4, h: 2 },
  ]);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem("gridLayout", JSON.stringify(newLayout)); // Save layout changes
  };

  return (
    <GridLayout
      className="grid-layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={handleLayoutChange}
    >
      <div key="sales" className="widget">
        <SalesWidget />
      </div>
      <div key="inventory" className="widget">
        <InventoryWidget />
      </div>
      <div key="compliance" className="widget">
        <ComplianceWidget />
      </div>
    </GridLayout>
  );
};

export default GridLayoutComponent;
