import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext"
import "../../styles/Products.css";
import jsPDF from "jspdf"; // For generating PDF files
import "jspdf-autotable"; // For creating tables in PDFs
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs`;


const Products = () => {
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    strain: '',
    price: '',
    stock: '',
    thc_content: '',
    cbd_content: '',
    medical_benefits: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const result = await actions.fetchProducts();
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "custom") {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: '' });
    } else {
      setIsCustomCategory(false);
      setFormData({ ...formData, category: selectedValue });
    }
  };

  // CRUD functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await actions.addProduct(formData);
    if (result.success) {
      setShowAddModal(false);
      setIsCustomCategory(false);
      setFormData({
        name: '',
        category: '',
        strain: '',
        price: '',
        stock: '',
        thc_content: '',
        cbd_content: '',
        medical_benefits: ''
      });
    } else {
      setError(result.error);
    }
  };


  const predefinedCategories = [
    "Flower", "Edible", "Concentrate", "Topical", "Pre-rolls",
    "Vape", "Tincture", "Capsules", "CBD Products", "Accessories",
    "Clones and Seeds", "Beverages", "Pet Products", "Suppositories", "Miscellaneous"
  ];

  const handleEdit = (product) => {
    setSelectedProduct(product);
    // Check if the product's category is in the predefined list
    const isCustom = !predefinedCategories.includes(product.category);
    setIsCustomCategory(isCustom);

    setFormData({
      name: product.name,
      category: product.category,
      strain: product.strain,
      price: product.price,
      stock: product.stock,
      thc_content: product.thc_content,
      cbd_content: product.cbd_content,
      medical_benefits: product.medical_benefits
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const result = await actions.editProduct(selectedProduct.id, formData);
    if (result.success) {
      setShowEditModal(false);
      setIsCustomCategory(false);
      setSelectedProduct(null);
      setFormData({
        name: '',
        category: '',
        strain: '',
        price: '',
        stock: '',
        thc_content: '',
        cbd_content: '',
        medical_benefits: ''
      });
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await actions.deleteProduct(productId);
      if (!result.success) {
        setError(result.error);
      }
    }
  };

  // Export functions
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

  if (loading) {
    return (
      <div className="main-content">
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target.result;

      // Parse CSV content into rows
      const rows = csvContent.split("\n").map((row) => row.split(","));
      const headers = rows[0]; // Assuming the first row is the header
      const products = rows.slice(1).map((row) => {
        const product = {};
        headers.forEach((header, index) => {
          product[header.trim()] = row[index].trim();
        });
        return product;
      });

      // Send products to the backend
      try {
        const response = await fetch(process.env.BACKEND_URL + '/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Products uploaded successfully:", result);
          loadProducts(); // Reload products after successful upload
        } else {
          console.error("Failed to upload products:", await response.json());
        }
      } catch (error) {
        console.error("Error uploading products:", error);
      }
    };

    reader.readAsText(file);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    console.log("break point one")
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (event) => {
      const pdfData = new Uint8Array(event.target.result);
      const pdf = await getDocument({ data: pdfData }).promise;
      console.log("break point two")
      let textContent = "";
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const text = await page.getTextContent();
        text.items.forEach((item) => {
          textContent += item.str;
        });
      }

      console.log("Extracted PDF content:", textContent);

      // Process extracted text (e.g., split into rows, map to products, etc.)
      const products = textContent.split("\n").map((line) => {
        const [name, category, strain, price, stock, thc_content, cbd_content] = line.split(",");
        return {
          name: name?.trim(),
          category: category?.trim(),
          strain: strain?.trim(),
          price: parseFloat(price?.trim()),
          stock: parseInt(stock?.trim(), 10),
          thc_content: parseFloat(thc_content?.trim()),
          cbd_content: parseFloat(cbd_content?.trim()),
        };
      });

      // Send products to the backend
      try {
        const response = await fetch(process.env.BACKEND_URL + '/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Products uploaded successfully:", result);
          loadProducts(); // Reload products after successful upload
        } else {
          console.error("Failed to upload products:", await response.json());
        }
      } catch (error) {
        console.error("Error uploading products:", error);
      }
    };


  };

  return (
    <div className="products-main-content">
      <div className="products-page">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        <header className="products-header flex-column align-items-start">
          <h1>Products</h1>
          <div className="button-group d-flex gap-2 mt-3 w-100 justify-content-end">
            {/* <button
              className="btn btn-dark me-2"
              onClick={() => setShowAddModal(true)}
            >
              Add Product
            </button> */}
            <div className="dropdown">
              <button className="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Import Products
              </button>
              <ul className="dropdown-menu mt-0">
                <li>
                  <label className="dropdown-item" style={{ cursor: 'pointer' }}>
                    <i className="fa-regular fa-file-pdf me-2"></i>Import PDF
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePDFUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </li>
                <li>
                  <label className="dropdown-item" style={{ cursor: 'pointer' }}>
                    <i className="fa-solid fa-file-csv me-2"></i>Import CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </li>
              </ul>
            </div>
            <div className="dropdown">
              <button className="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Export Products
              </button>
              <ul className="dropdown-menu mt-0">
                <li>
                  <button className="dropdown-item" onClick={handleGeneratePDF}>
                    <i className="fa-regular fa-file-pdf me-2"></i>Export PDF
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleGenerateCSV}>
                    <i className="fa-solid fa-file-csv me-2"></i>Export CSV
                  </button>
                </li>
              </ul>

            </div>
          </div>
        </header>


        <div className="products-table-container">
          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddModal(true)}
            >
              <b><i className="fa-solid fa-circle-plus"></i> Product</b>
            </button>
          </div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Strain</th>
                <th>Price</th>
                <th>Stock</th>
                <th>THC/CBD</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.strain}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.thc_content}% / {product.cbd_content}%</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(product)}
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(showAddModal || showEditModal) && (
          <>
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {showAddModal ? 'Add New Product' : 'Edit Product'}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedProduct(null);
                        setFormData({
                          name: '',
                          category: '',
                          strain: '',
                          price: '',
                          stock: '',
                          thc_content: '',
                          cbd_content: '',
                          medical_benefits: ''
                        });
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={showAddModal ? handleSubmit : handleEditSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>


                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        {!isCustomCategory ? (
                          <select
                            className="form-select"
                            value={formData.category}
                            onChange={handleCategoryChange}
                            required
                          >
                            <option value="">Select category</option>
                            {predefinedCategories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                            <option value="custom">+ Add New Category</option>
                          </select>
                        ) : (
                          <div>
                            <input
                              type="text"
                              className="form-control mb-2"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              placeholder="Enter new category"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setIsCustomCategory(false);
                                setFormData({ ...formData, category: '' });
                              }}
                            >
                              Back to Category List
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Strain</label>
                        <select
                          className="form-select"
                          value={formData.strain}
                          onChange={(e) => setFormData({ ...formData, strain: e.target.value })}
                          required
                        >
                          <option value="">Select strain</option>
                          <option value="Sativa">Sativa</option>
                          <option value="Indica">Indica</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white'
                            }}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Stock</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">THC %</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            value={formData.thc_content}
                            onChange={(e) => setFormData({ ...formData, thc_content: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">CBD %</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            value={formData.cbd_content}
                            onChange={(e) => setFormData({ ...formData, cbd_content: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Medical Benefits</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.medical_benefits}
                          onChange={(e) => setFormData({ ...formData, medical_benefits: e.target.value })}
                          required
                        ></textarea>
                      </div>

                      <div className="modal-footer px-0 pb-0">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowAddModal(false);
                            setShowEditModal(false);
                            setSelectedProduct(null);
                            setFormData({
                              name: '',
                              category: '',
                              strain: '',
                              price: '',
                              stock: '',
                              thc_content: '',
                              cbd_content: '',
                              medical_benefits: ''
                            });
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {showAddModal ? 'Add Product' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </div>
    </div >
  );
};

export default Products;