import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext"
import "../../styles/Products.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
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

  const predefinedCategories = [
    "Flower", "Edible", "Concentrate", "Topical", "Pre-rolls",
    "Vape", "Tincture", "Capsules", "CBD Products", "Accessories",
    "Clones and Seeds", "Beverages", "Pet Products", "Suppositories", "Miscellaneous"
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    // Check if user is authenticated
    if (!store.token) {
      setError("Please log in to view products");
      setLoading(false);
      return;
    }
    
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

  const resetForm = () => {
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
    setIsCustomCategory(false);
    setSelectedProduct(null);
    setShowAddModal(false);
    setShowEditModal(false);
  };

  // CRUD functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const result = await actions.addProduct(formData);
    if (result.success) {
      resetForm();
    } else {
      setError(result.error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
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
    setError(null);
    
    const result = await actions.editProduct(selectedProduct.id, formData);
    if (result.success) {
      resetForm();
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
    if (!store.products || store.products.length === 0) {
      setError("No products to export");
      return;
    }

    const doc = new jsPDF();
    doc.text("Product List", 14, 10);

    const tableColumn = ["Name", "Category", "Strain", "Price", "Stock", "THC %", "CBD %"];
    const tableRows = store.products.map((product) => [
      product.name,
      product.category,
      product.strain,
      `$${parseFloat(product.price).toFixed(2)}`,
      product.stock,
      `${product.thc_content}%`,
      `${product.cbd_content}%`,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("ProductList.pdf");
  };

  const handleGenerateCSV = () => {
    if (!store.products || store.products.length === 0) {
      setError("No products to export");
      return;
    }

    const headers = ["Name", "Category", "Strain", "Price", "Stock", "THC %", "CBD %"];
    const rows = store.products.map((product) => [
      `"${product.name}"`,
      `"${product.category}"`,
      `"${product.strain}"`,
      parseFloat(product.price).toFixed(2),
      product.stock,
      product.thc_content,
      product.cbd_content,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "ProductList.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import functions - using flux actions
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvContent = event.target.result;
        const rows = csvContent.split("\n").filter(row => row.trim());
        
        if (rows.length < 2) {
          setError("CSV file is empty or has no data rows");
          return;
        }

        const headers = rows[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        
        const products = rows.slice(1).map((row) => {
          const values = row.split(",").map(v => v.trim().replace(/['"]/g, ''));
          const product = {};
          
          headers.forEach((header, index) => {
            // Map common CSV header names to our field names
            const fieldMapping = {
              'name': 'name',
              'product': 'name',
              'product name': 'name',
              'category': 'category',
              'type': 'category',
              'strain': 'strain',
              'price': 'price',
              'unit price': 'price',
              'cost': 'price',
              'stock': 'stock',
              'quantity': 'stock',
              'current stock': 'stock',
              'thc': 'thc_content',
              'thc %': 'thc_content',
              'thc_content': 'thc_content',
              'cbd': 'cbd_content',
              'cbd %': 'cbd_content',
              'cbd_content': 'cbd_content',
              'benefits': 'medical_benefits',
              'medical benefits': 'medical_benefits',
              'medical_benefits': 'medical_benefits'
            };
            
            const fieldName = fieldMapping[header] || header;
            product[fieldName] = values[index] || '';
          });
          
          return product;
        }).filter(p => p.name); // Filter out empty rows

        if (products.length === 0) {
          setError("No valid products found in CSV");
          return;
        }

        const result = await actions.bulkAddProducts(products);
        if (result.success) {
          alert(`Successfully imported products!`);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Error parsing CSV file: " + err.message);
      }
    };

    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again
    e.target.value = '';
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const pdfData = new Uint8Array(event.target.result);
        const pdf = await getDocument({ data: pdfData }).promise;

        let textContent = "";
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const text = await page.getTextContent();
          text.items.forEach((item) => {
            textContent += item.str + " ";
          });
          textContent += "\n";
        }

        console.log("Extracted PDF content:", textContent);

        // Parse the extracted text - this is a simple parser
        // You may need to adjust based on your PDF format
        const lines = textContent.split("\n").filter(line => line.trim());
        const products = [];

        for (const line of lines) {
          const parts = line.split(/\s{2,}|\t/).map(p => p.trim()).filter(p => p);
          
          if (parts.length >= 3) {
            products.push({
              name: parts[0] || '',
              category: parts[1] || 'Uncategorized',
              strain: parts[2] || '',
              price: parseFloat(parts[3]) || 0,
              stock: parseInt(parts[4]) || 0,
              thc_content: parseFloat(parts[5]) || 0,
              cbd_content: parseFloat(parts[6]) || 0,
            });
          }
        }

        if (products.length === 0) {
          setError("No valid products found in PDF. Please ensure the PDF has tabular data.");
          return;
        }

        const result = await actions.bulkAddProducts(products);
        if (result.success) {
          alert(`Successfully imported products from PDF!`);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Error parsing PDF file: " + err.message);
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Loading state
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

  // Not authenticated
  if (!store.token) {
    return (
      <div className="main-content">
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="alert alert-warning">
            Please log in to view products.
          </div>
        </div>
      </div>
    );
  }

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
          <h1 style={{ color: "#ffab00", fontWeight: 900 }}>Products</h1>
          <div className="button-group d-flex gap-2 mt-3 w-100 justify-content-end">
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
          
          {store.products && store.products.length > 0 ? (
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
                    <td>${parseFloat(product.price).toFixed(2)}</td>
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
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No products found. Add your first product!</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
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
                      onClick={resetForm}
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
                          <label className="form-label">Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Stock</label>
                          <input
                            type="number"
                            min="0"
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
                            min="0"
                            max="100"
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
                            min="0"
                            max="100"
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
                        ></textarea>
                      </div>

                      <div className="modal-footer px-0 pb-0">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={resetForm}
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
    </div>
  );
};

export default Products;