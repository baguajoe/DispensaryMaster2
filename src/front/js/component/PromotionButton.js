import React from "react";

const PromotionButton = ({ handleApplyPromotion }) => {
  return (
    <div>
      <button onClick={handleApplyPromotion}>Apply Promotion</button>
    </div>
  );
};

export default PromotionButton;
