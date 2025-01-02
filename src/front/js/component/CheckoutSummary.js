import React from "react";

const CheckoutSummary = ({ total, discount, taxRate }) => {
  const discountedPrice = total * (1 - discount / 100);
  const finalPrice = discountedPrice * (1 + taxRate / 100);

  return (
    <div>
      <p>Original Total: ${total.toFixed(2)}</p>
      <p>Discount Applied: {discount}%</p>
      <p>Tax Rate: {taxRate}%</p>
      <p>Final Total: ${finalPrice.toFixed(2)}</p>
    </div>
  );
};

export default CheckoutSummary;
