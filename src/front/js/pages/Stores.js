import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/stores.css";

const Stores = () => {
  const [stores, setStores]=useState([])
    useEffect(() => {
      // Fetch stores from the backend
      fetch(process.env.BACKEND_URL + "/api/store", { headers: { "Content-Type": "application/json","Authorization": "Bearer " + sessionStorage.getItem("token") } })
        .then((response) => response.json())
        .then((data) => {
          setStores(data);
        
        })
        .catch((error) => {
          console.error("Error fetching stores:", error);
         
        });
  
    }, []);
  return (
    <div className="p-6 bg-gray-100 min-h-screen main-content">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stores</h1>
        <Link to="/stores/add" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800">
          + Add Store
        </Link>
      </div>

      <table className="table-auto w-full rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Location</th>
            <th className="px-4 py-2 text-left">Store Manager</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Employee Count</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">{store.name}</td>
              <td className="px-4 py-2">{store.location}</td>
              <td className="px-4 py-2">{store.store_manager}</td>
              <td className="px-4 py-2">{store.phone}</td>
              <td className="px-4 py-2">{store.status}</td>
              <td className="px-4 py-2">{store.employee_count}</td>
              <td className="px-4 py-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Stores;
