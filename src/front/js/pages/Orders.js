import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import OrderItemsComponent from "../component/OrderItems";

import "../../styles/orders.css";


const Orders = () => {
  const { store, actions } = useContext(Context);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Simplified form data to match backend expectations
  const [formData, setFormData] = useState({
    customer_id: '',
    items: []
  });

  const [orderItemForm, setOrderItemForm] = useState({
    product_id: '',
    quantity: '',
    unit_price: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (showAddModal || showEditModal) {
      actions.fetchProducts();
      actions.fetchCustomers();
    }
  }, [showAddModal, showEditModal]);

  const loadOrders = async () => {
    setIsLoading(true);
    const result = await actions.fetchOrders();
    if (!result.success) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await actions.addOrder(formData);
    if (result.success) {
      setShowAddModal(false);
      resetForm();
      loadOrders();
    } else {
      setError(result.error);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      customer_id: order.customer_id.toString(),
      items: order.order_items || []
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const result = await actions.editOrder(selectedOrder.id, formData);
    if (result.success) {
      setShowEditModal(false);
      resetForm();
      loadOrders();
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const result = await actions.deleteOrder(orderId);
      if (result.success) {
        loadOrders();
      } else {
        setError(result.error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      items: []
    });
    setOrderItemForm({
      product_id: '',
      quantity: '',
      unit_price: ''
    });
    setSelectedOrder(null);
  };

  const handleAddItem = async () => {
    const newItem = {
      product_id: parseInt(orderItemForm.product_id),
      quantity: parseInt(orderItemForm.quantity),
      unit_price: parseFloat(orderItemForm.unit_price)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setOrderItemForm({
      product_id: '',
      quantity: '',
      unit_price: ''
    });

    await actions.fetchProducts();
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text("Orders List", 14, 10);

    const tableColumn = ["Order ID", "Customer", "Total Amount", "Items"];
    const tableRows = store.orders.map((order) => [
      order.id,
      order.customer_id,
      `$${(order.items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}`,
      (order.items || []).length
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("OrdersList.pdf");
  };

  const handleGenerateCSV = () => {
    const headers = ["Order ID,Customer,Total Amount,Items"];
    const rows = store.orders.map((order) => [
      order.id,
      order.customer_id,
      (order.items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2),
      (order.items || []).length
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "OrdersList.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Edit Order' : 'Add New Order'}</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitForm}>
                  {/* <div className="mb-3">
                    <label className="form-label">Customer ID</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      required
                    />
                  </div> */}
                  <div className="mb-3">
                    <label className="form-label">Customer</label>
                    <select
                      className="form-select"
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      required
                    >
                      <option value="">Select Customer</option>
                      {store.customers?.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <OrderItemsComponent
                    orderItemForm={orderItemForm}
                    setOrderItemForm={setOrderItemForm}
                    handleAddItem={handleAddItem}
                    items={formData.items}
                    handleRemoveItem={handleRemoveItem}
                    totalAmount={formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)}
                  />

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleClose}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formData.items.length === 0}
                    >
                      {isEdit ? 'Save Changes' : 'Create Order'}
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

  if (isLoading) {
    return (
      <div className="orders-page">
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
      <div className="orders-page">
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="orders-header flex-column align-items-start">
        <h1>Orders</h1>
        <div className="button-group d-flex gap-2 mt-3 w-100 justify-content-end">
          <div className="dropdown">
            <button className="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Export Orders
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
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-2"></i>New Order
          </button>
        </div>
      </header>

      <div className="orders-table-container">
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Items</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.orders?.length > 0 ? (
                store.orders.map((order) => {
                  const customer = store.customers?.find(c => c.id === parseInt(order.customer_id));
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{customer ? `${customer.first_name} ${customer.last_name}` : order.customer_id}</td>
                      <td>
                        ${(order.items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                      </td>
                      <td>{(order.items || []).length} items</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(order)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(order.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    <p className="text-light mb-0">No orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renderModal(false)}
      {renderModal(true)}
    </div>
  );
};

export default Orders;