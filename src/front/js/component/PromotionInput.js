import React from "react";

const PromotionInput = ({ originalPrice, setOriginalPrice, promotionId, setPromotionId }) => {
  return (
    <div>
      {/* Input for Original Price */}
      <div>
        <label htmlFor="originalPrice">Original Price: </label>
        <input
          type="number"
          id="originalPrice"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(parseFloat(e.target.value))}
        />
      </div>

      {/* Input for Promotion ID */}
      <div>
        <label htmlFor="promotionId">Promotion ID: </label>
        <input
          type="text"
          id="promotionId"
          value={promotionId}
          onChange={(e) => setPromotionId(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PromotionInput;
