import React, { useState } from "react";
import BarcodeScanner from "./BarcodeScanner";

const BarcodeScannerPage = () => {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [success, setSuccess] = useState(false); // Success feedback

  const handleBarcodeScan = (barcode) => {
    setLoading(true); // Start loading
    setError("");
    setSuccess(false);

    // Fetch product details based on the scanned barcode
    fetch(`/api/products/${barcode}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product not found.");
        }
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setError("");
        setSuccess(true); // Show success message
      })
      .catch((err) => {
        setProduct(null);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false); // Stop loading
      });
  };

  return (
    <div className="barcode-scanner-page">
      <h1>Scan Product Barcode</h1>
      <BarcodeScanner onScan={handleBarcodeScan} />

      {/* Loading Feedback */}
      {loading && <p className="loading">Fetching product details...</p>}

      {/* Success Message */}
      {success && !error && <p className="success">Product found!</p>}

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Product Details */}
      <div className="product-info">
        {product ? (
          <div>
            <h2>Product Details:</h2>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> ${product.unit_price}</p>
            <p><strong>Stock:</strong> {product.current_stock}</p>
          </div>
        ) : (
          !error && !loading && <p>Scan a barcode to see product details.</p>
        )}
      </div>
    </div>
  );
};

export default BarcodeScannerPage;
