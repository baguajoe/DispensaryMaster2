import React, { useContext } from 'react';
import { Context } from "../store/appContext";
import PropTypes from 'prop-types';

const OrderItemsComponent = ({
  orderItemForm,
  setOrderItemForm,
  handleAddItem,
  items,
  handleRemoveItem,
  totalAmount
}) => {
  const { store } = useContext(Context);

  // Find selected product to show max quantity available
  const selectedProduct = store.products.find(p => p.id === parseInt(orderItemForm.product_id));

  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    const product = store.products.find(p => p.id === productId);

    setOrderItemForm({
      ...orderItemForm,
      product_id: productId,
      unit_price: product ? product.price : ''
    });
  };

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || '';

    // Prevent setting quantity higher than available stock
    if (selectedProduct && quantity > selectedProduct.stock) {
      setOrderItemForm({
        ...orderItemForm,
        quantity: selectedProduct.stock
      });
    } else {
      setOrderItemForm({
        ...orderItemForm,
        quantity
      });
    }
  };

  return (
    <div className="mb-4">
      <h6 className="mb-3">Order Items</h6>
      <div className="card bg-dark text-white p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <select
              className="form-select"
              value={orderItemForm.product_id}
              onChange={handleProductChange}
            >
              <option value="">Select Product</option>
              {store.products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                  disabled={product.stock === 0}
                >
                  {product.name} - ${product.price} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                placeholder="Quantity"
                value={orderItemForm.quantity}
                onChange={handleQuantityChange}
                min="1"
                max={selectedProduct ? selectedProduct.stock : ""}
              />
              {selectedProduct && (
                <span className="input-group-text">
                  Max: {selectedProduct.stock}
                </span>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleAddItem}
              disabled={!orderItemForm.product_id || !orderItemForm.quantity}
            >
              <i className="fas fa-plus me-2"></i>Add Item
            </button>
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const product = store.products.find(p => p.id === item.product_id);
                return (
                  <tr key={index}>
                    <td>{product ? product.name : 'Unknown Product'}</td>
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
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td colSpan="2">
                  <strong>${items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">
          No items added to the order yet
        </div>
      )}
    </div>
  );
};

OrderItemsComponent.propTypes = {
  orderItemForm: PropTypes.shape({
    product_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  setOrderItemForm: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  handleRemoveItem: PropTypes.func.isRequired,
  totalAmount: PropTypes.number
};

export default OrderItemsComponent;