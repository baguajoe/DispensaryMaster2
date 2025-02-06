import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../../styles/orders.css";

const Orders = () => {
  const { store, actions } = useContext(Context);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    total_amount: '',
    refund_amount: '0.00',
    status: 'pending',
    payment_status: 'unpaid',
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
      customer_id: order.customer_id,
      total_amount: order.total_amount,
      refund_amount: order.refund_amount,
      status: order.status,
      payment_status: order.payment_status,
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
      total_amount: '',
      refund_amount: '0.00',
      status: 'pending',
      payment_status: 'unpaid',
      items: []
    });
    setOrderItemForm({
      product_id: '',
      quantity: '',
      unit_price: ''
    });
    setSelectedOrder(null);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, orderItemForm],
      total_amount: parseFloat(formData.total_amount || 0) +
        (parseFloat(orderItemForm.unit_price) * parseInt(orderItemForm.quantity))
    });
    setOrderItemForm({ product_id: '', quantity: '', unit_price: '' });
  };

  const handleRemoveItem = (index) => {
    const items = [...formData.items];
    const removedItem = items[index];
    items.splice(index, 1);
    setFormData({
      ...formData,
      items,
      total_amount: parseFloat(formData.total_amount) -
        (parseFloat(removedItem.unit_price) * parseInt(removedItem.quantity))
    });
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text("Orders List", 14, 10);

    const tableColumn = ["Order ID", "Customer", "Total Amount", "Status", "Payment Status"];
    const tableRows = store.orders.map((order) => [
      order.id,
      order.customer_id,
      `$${order.total_amount}`,
      order.status,
      order.payment_status
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("OrdersList.pdf");
  };

  const handleGenerateCSV = () => {
    const headers = ["Order ID,Customer,Total Amount,Status,Payment Status"];
    const rows = store.orders.map((order) => [
      order.id,
      order.customer_id,
      order.total_amount,
      order.status,
      order.payment_status
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
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Customer ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.customer_id}
                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Payment Status</label>
                      <select
                        className="form-select"
                        value={formData.payment_status}
                        onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                        required
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Refund Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.refund_amount}
                        onChange={(e) => setFormData({ ...formData, refund_amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="mb-3">Order Items</h6>
                    <div className="card bg-dark text-white p-3 mb-3">
                      <div className="row g-2">
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Product ID"
                            value={orderItemForm.product_id}
                            onChange={(e) => setOrderItemForm({
                              ...orderItemForm,
                              product_id: e.target.value
                            })}
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Quantity"
                            value={orderItemForm.quantity}
                            onChange={(e) => setOrderItemForm({
                              ...orderItemForm,
                              quantity: e.target.value
                            })}
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            placeholder="Unit Price"
                            value={orderItemForm.unit_price}
                            onChange={(e) => setOrderItemForm({
                              ...orderItemForm,
                              unit_price: e.target.value
                            })}
                          />
                        </div>
                        <div className="col-md-3">
                          <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={handleAddItem}
                            disabled={!orderItemForm.product_id || !orderItemForm.quantity || !orderItemForm.unit_price}
                          >
                            <i className="fas fa-plus me-2"></i>Add Item
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-dark table-hover">
                        <thead>
                          <tr>
                            <th>Product ID</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product_id}</td>
                              <td>{item.quantity}</td>
                              <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                              <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                            <td colSpan="2">
                              <strong>${formData.total_amount ? parseFloat(formData.total_amount).toFixed(2) : '0.00'}</strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

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
                <th>Refund Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.orders?.length > 0 ? (
                store.orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer_id}</td>
                    <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>${parseFloat(order.refund_amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.payment_status.toLowerCase()}`}>
                        {order.payment_status}
                      </span>
                    </td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    <p className="text-light mb-0">No orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renderModal(false)} {/* Add Modal */}
      {renderModal(true)} {/* Edit Modal */}
    </div>
  );
};

export default Orders;