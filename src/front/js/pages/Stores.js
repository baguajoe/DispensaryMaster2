import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../../styles/stores.css";

const Stores = () => {
  const { store, actions } = useContext(Context);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    store_manager: '',
    phone: '',
    status: '',
    employee_count: ''
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setIsLoading(true);
    const result = await actions.fetchStores();
    if (!result.success) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await actions.addStore(formData);
    if (result.success) {
      setShowAddModal(false);
      resetForm();
      loadStores();
    } else {
      setError(result.error);
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      location: store.location,
      store_manager: store.store_manager,
      phone: store.phone,
      status: store.status,
      employee_count: store.employee_count
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const result = await actions.editStore(selectedStore.id, formData);
    if (result.success) {
      setShowEditModal(false);
      resetForm();
      loadStores();
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      const result = await actions.deleteStore(storeId);
      if (result.success) {
        loadStores();
      } else {
        setError(result.error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      store_manager: '',
      phone: '',
      status: '',
      employee_count: ''
    });
    setSelectedStore(null);
  };


  // Export functions
  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.text("Stores List", 14, 10);

    // Prepare table headers and rows
    const tableColumn = ["Name", "Location", "Store Manager", "Phone", "Status", "Employee Count"];
    const tableRows = store.stores.map((store) => [
      store.name,
      store.location,
      store.store_manager,
      store.phone,
      store.status,
      store.employee_count,
    ]);

    // Add table to the PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    // Save the PDF
    doc.save("StoresList.pdf");
  };

  const handleGenerateCSV = () => {
    // Prepare CSV headers and rows
    const headers = ["Name,Location,Store Manager,Phone,Status,Employee Count"];
    const rows = store.stores.map((store) => [
      `"${store.name}"`,
      `"${store.location}"`,
      `"${store.store_manager}"`,
      `"${store.phone}"`,
      `"${store.status}"`,
      `${store.employee_count}`,
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
    link.setAttribute("download", "StoresList.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="stores-page">
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stores-page">
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      </div>
    );
  }

  const renderModal = (isEdit = false) => {
    const modalShow = isEdit ? showEditModal : showAddModal;
    const handleClose = () => {
      isEdit ? setShowEditModal(false) : setShowAddModal(false);
      resetForm();
    };
    const handleSubmitForm = isEdit ? handleEditSubmit : handleSubmit;

    return modalShow ? (
      <>
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Edit Store' : 'Add New Store'}</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitForm}>
                  <div className="mb-3">
                    <label className="form-label">Store Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Store Manager</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.store_manager}
                      onChange={(e) => setFormData({ ...formData, store_manager: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Employee Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.employee_count}
                      onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                      required
                    />
                  </div>

                  <div className="modal-footer px-0 pb-0">
                    <button type="button" className="btn btn-secondary" onClick={handleClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEdit ? 'Save Changes' : 'Add Store'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
      </>
    ) : null;
  };

  return (
    <div className="stores-page">
      <header className="stores-header flex-column align-items-start">
        <h1>Stores</h1>
        <div className="button-group d-flex gap-2 mt-3 w-100 justify-content-end">
          <div className="dropdown">
            <button className="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Export Stores
            </button>
            <ul className="dropdown-menu dropdown-menu-end mt-0">
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


      <div className="stores-table-container">
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <b><i className="fa-solid fa-circle-plus"></i> Store</b>
          </button>
        </div>
        <table className="stores-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Store Manager</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Employee Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {store.stores?.length > 0 ? (
              store.stores.map((store, index) => (
                <tr key={index}>
                  <td>{store.name}</td>
                  <td>{store.location}</td>
                  <td>{store.store_manager}</td>
                  <td>{store.phone}</td>
                  <td>
                    <span className={`status-badge ${store.status.toLowerCase()}`}>
                      {store.status}
                    </span>
                  </td>
                  <td>{store.employee_count}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(store)}
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(store.id)}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  <p className="text-light mb-0">No stores found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderModal(false)} {/* Add Modal */}
      {renderModal(true)} {/* Edit Modal */}
    </div>
  );
};

export default Stores;