import React, { useEffect, useState } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";


// const ProductsComponent = () => {
//   const [products, setProducts] = useState([]);
//   const [newProduct, setNewProduct] = useState({ name: '', category: '', unit_price: 0 });

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch(process.env.BACKEND_URL + '/api/products');
//         const data = await response.json();
//         setProducts(data);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleAddProduct = async () => {
//     try {
//       const response = await fetch(process.env.BACKEND_URL + '/api/products', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newProduct),
//       });
//       const createdProduct = await response.json();
//       setProducts((prevProducts) => [...prevProducts, createdProduct]);
//       setNewProduct({ name: '', category: '', unit_price: 0 });
//     } catch (error) {
//       console.error('Error adding product:', error);
//     }
//   };

//   return (
//     <div className="products-container">
//       <h1>Product Management</h1>

//       {/* Products List */}
//       <div className="products-list">
//         <h2>Available Products</h2>
//         <ul>
//           {products.map((product) => (
//             <li key={product.id}>
//               {product.name} - ${product.unit_price.toFixed(2)} - {product.category}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Add New Product */}
//       <div className="add-product">
//         <h2>Add New Product</h2>
//         <input
//           type="text"
//           placeholder="Name"
//           value={newProduct.name}
//           onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
//         />
//         <input
//           type="text"
//           placeholder="Category"
//           value={newProduct.category}
//           onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
//         />
//         <input
//           type="number"
//           placeholder="Price"
//           value={newProduct.unit_price}
//           onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) })}
//         />
//         <button onClick={handleAddProduct}>Add Product</button>
//       </div>
//     </div>
//   );
// };

// export default ProductsComponent;


const ProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', unit_price: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(process.env.BACKEND_URL + '/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    try {
      const response = await fetch(process.env.BACKEND_URL + '/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const createdProduct = await response.json();
      setProducts((prevProducts) => [...prevProducts, createdProduct]);
      setNewProduct({ name: '', category: '', unit_price: 0 });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.text("Product List", 14, 10);

    // Prepare table headers and rows
    const tableColumn = ["Name", "Category", "Price"];
    const tableRows = products.map((product) => [
      product.name,
      product.category,
      `$${product.unit_price.toFixed(2)}`,
    ]);

    // Add table to the PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    // Save the PDF
    doc.save("ProductList.pdf");
  };

  const handleGenerateCSV = () => {
    // Prepare CSV headers and rows
    const headers = ["Name,Category,Price"];
    const rows = products.map((product) => [
      `"${product.name}"`,
      `"${product.category}"`,
      `${product.unit_price.toFixed(2)}`,
    ]);

    // Combine headers and rows into a single CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a Blob object and trigger file download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "ProductList.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.text("Product List", 14, 10);

    // Prepare table headers and rows
    const tableColumn = ["Name", "Category", "Strain", "Price", "Stock", "THC %", "CBD %"];
    const tableRows = store.products.map((product) => [
      product.name,
      product.category,
      product.strain,
      `$${product.price.toFixed(2)}`,
      product.stock,
      `${product.thc_content}%`,
      `${product.cbd_content}%`,
    ]);

    // Add table to the PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    // Save the PDF
    doc.save("ProductList.pdf");
  };

  const handleGenerateCSV = () => {
    // Prepare CSV headers and rows
    const headers = ["Name,Category,Strain,Price,Stock,THC %,CBD %"];
    const rows = store.products.map((product) => [
      `"${product.name}"`,
      `"${product.category}"`,
      `"${product.strain}"`,
      `${product.price.toFixed(2)}`,
      `${product.stock}`,
      `${product.thc_content}`,
      `${product.cbd_content}`,
    ]);

    // Combine headers and rows into a single CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a Blob object and trigger file download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "ProductList.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="products-container">
      <h1>Product Management</h1>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button onClick={handleGeneratePDF} className="btn btn-primary">
          Download PDF
        </button>
        <button onClick={handleGenerateCSV} className="btn btn-secondary">
          Download CSV
        </button>
      </div>

      {/* Products List */}
      <div className="products-list">
        <h2>Available Products</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - ${product.unit_price.toFixed(2)} - {product.category}
            </li>
          ))}
        </ul>
      </div>


      {/* Add New Product */}
      <div className="add-product">
        <h2>Add New Product</h2>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.unit_price}
          onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) })}
        />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>
    </div>
  );
};

export default ProductsComponent;

