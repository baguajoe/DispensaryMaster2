import React, { useContext } from "react";
import { Context } from "../store/appContext";

const OrderItemsComponent = ({
  orderItemForm,
  setOrderItemForm,
  handleAddItem,
  items,
  handleRemoveItem,
  totalAmount
}) => {
  const { store } = useContext(Context);

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = store.products?.find(p => p.id === parseInt(productId));
    
    setOrderItemForm({
      ...orderItemForm,
      product_id: productId,
      unit_price: product ? (product.price || product.unit_price || '') : ''
    });
  };

  const getProductName = (productId) => {
    const product = store.products?.find(p => p.id === parseInt(productId));
    return product ? product.name : `Product #${productId}`;
  };

  return (
    <div className="order-items-section">
      <h6 className="mb-3">Order Items</h6>
      
      {/* Add Item Form */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Product</label>
              <select
                className="form-select"
                value={orderItemForm.product_id}
                onChange={handleProductChange}
              >
                <option value="">Select Product</option>
                {store.products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price || product.unit_price} 
                    (Stock: {product.stock || product.current_stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={orderItemForm.quantity}
                onChange={(e) => setOrderItemForm({ ...orderItemForm, quantity: e.target.value })}
                placeholder="Qty"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={orderItemForm.unit_price}
                onChange={(e) => setOrderItemForm({ ...orderItemForm, unit_price: e.target.value })}
                placeholder="Price"
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleAddItem}
                disabled={!orderItemForm.product_id || !orderItemForm.quantity || !orderItemForm.unit_price}
              >
                <i className="fas fa-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{getProductName(item.product_id)}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-dark">
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td colSpan="2"><strong>${totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No items added yet. Select a product and add it to the order.
        </div>
      )}
    </div>
  );
};

export default OrderItemsComponent;