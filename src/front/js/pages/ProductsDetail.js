import React from "react";

const ProductsDetail = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="bg-gray-200 h-96 rounded-lg shadow-md"></div>
        </div>

        {/* Product Information */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">Product Name</h1>
          <p className="text-gray-600 mb-4">
            Short description, color, size, or other relevant details go here.
          </p>
          <div className="mb-4">
            <span className="text-2xl font-semibold">$95</span>{" "}
            <span className="text-gray-500 line-through">$119</span>{" "}
            <span className="text-green-600">-20%</span>
          </div>
          <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800">
            Add to Cart
          </button>
          <p className="mt-4 text-gray-500">Available - Shipping within 3-4 days</p>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis
          ac neque.
        </p>
      </div>

      {/* Related Products */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg shadow-md p-4 flex flex-col items-center"
            >
              <div className="bg-gray-200 w-full h-40 rounded-md mb-4"></div>
              <h3 className="text-lg font-semibold">Product Name</h3>
              <p className="text-gray-600">$95</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsDetail;
