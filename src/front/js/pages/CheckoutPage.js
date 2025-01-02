import React, { useState } from "react";
import CheckoutSummary from "../component/CheckoutSummary"; // Importing CheckoutSummary component
import PromotionInput from "../component/PromotionInput"; // Importing PromotionInput component
import PromotionButton from "../component/PromotionButton"; // Importing PromotionButton component

const applyPromotion = async (originalPrice, promotionId) => {
  const response = await fetch("/promotions/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original_price: originalPrice, promotion_id: promotionId }),
  });

  if (!response.ok) {
    console.error("Failed to apply promotion");
    return null;
  }

  return await response.json();
};

const CheckoutPage = () => {
  const [originalPrice, setOriginalPrice] = useState(100.0); // Default total
  const [promotionId, setPromotionId] = useState(""); // Promotion ID input
  const [discount, setDiscount] = useState(0); // Discount applied
  const [taxRate, setTaxRate] = useState(5); // Tax rate percentage

  const handleApplyPromotion = async () => {
    if (!promotionId) {
      alert("Please enter a promotion ID");
      return;
    }

    const result = await applyPromotion(originalPrice, promotionId);
    if (result) {
      setDiscount(result.discount); // Update discount from API response
      setTaxRate(result.tax_rate); // Update tax rate from API response
      console.log("Promotion applied successfully:", result);
    } else {
      alert("Failed to apply promotion.");
    }
  };

  return (
    <div>
      <h1>Checkout</h1>

      {/* Promotion Input Section */}
      <PromotionInput
        originalPrice={originalPrice}
        setOriginalPrice={setOriginalPrice}
        promotionId={promotionId}
        setPromotionId={setPromotionId}
      />

      {/* Apply Promotion Button */}
      <PromotionButton handleApplyPromotion={handleApplyPromotion} />

      {/* Checkout Summary */}
      <CheckoutSummary total={originalPrice} discount={discount} taxRate={taxRate} />
    </div>
  );
};

export default CheckoutPage;
