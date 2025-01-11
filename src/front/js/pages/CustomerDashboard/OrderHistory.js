import React, { useState, useEffect } from "react";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    // Fetch orders (Replace with actual API call)
    const fetchOrders = async () => {
      const mockOrders = [
        { id: 1, date: "2025-01-01", status: "Delivered", total: "$50.00" },
        { id: 2, date: "2025-01-05", status: "Pending", total: "$30.00" },
      ];
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    };
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const results = orders.filter((order) =>
      order.id.toString().includes(e.target.value)
    );
    setFilteredOrders(results);
  };

  const handleFilter = () => {
    const filtered = orders.filter((order) => {
      const withinDateRange =
        (!dateRange.start || new Date(order.date) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(order.date) <= new Date(dateRange.end));
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return withinDateRange && matchesStatus;
    });
    setFilteredOrders(filtered);
  };

  return (
    <div>
      <h1>Order History</h1>
      <div>
        <input
          type="text"
          placeholder="Search by Order ID"
          value={search}
          onChange={handleSearch}
        />
        <select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="Delivered">Delivered</option>
          <option value="Pending">Pending</option>
        </select>
        <input
          type="date"
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
        />
        <input
          type="date"
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>
      <ul>
        {filteredOrders.map((order) => (
          <li key={order.id}>
            Order #{order.id} - {order.status} - {order.date} - {order.total}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory;
