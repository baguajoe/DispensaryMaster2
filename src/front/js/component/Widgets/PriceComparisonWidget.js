import React, { useState, useEffect } from "react";

const PriceComparisonWidget = ({ productId }) => {
  const [prices, setPrices] = useState([]); // Stores price data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch price data for the given product ID
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/price-comparison/${productId}`
        );
        if (!response.ok) throw new Error("Failed to fetch price data");
        const data = await response.json();
        setPrices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [productId]);

  return (
    <div className="price-comparison-widget p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Price Comparison</h2>
      {loading ? (
        <p>Loading prices...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Location</th>
              <th className="border border-gray-300 p-2">Supplier</th>
              <th className="border border-gray-300 p-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price) => (
              <tr key={price.id}>
                <td className="border border-gray-300 p-2">{price.location}</td>
                <td className="border border-gray-300 p-2">{price.supplier}</td>
                <td className="border border-gray-300 p-2">${price.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PriceComparisonWidget;
