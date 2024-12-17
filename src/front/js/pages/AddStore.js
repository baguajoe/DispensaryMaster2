import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';



const AddStore = () => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [store_manager, setStore_Manager] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('');
    const [employee_count, setEmployee_Count] = useState('');
    const navigate = useNavigate();

    const handleAddStore = async () => {
        const data = await fetch(process.env.BACKEND_URL + "/api/store", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sessionStorage.getItem("token") }, body: JSON.stringify({ name, location, store_manager, phone, status, employee_count }) })

        if (data.ok) {
            alert("Add Store was successful! ");
            // navigate("/"); // Redirect to the login page
            console.log("data from AddStore", data)
            navigate("/Stores")
        } else {
            // const errorMessage=data.data?.message || data.error || "unknown error ocurred";
            console.log("Add Store failed message", data)
            const errorMessage = data.data.error
            alert(`AddStore failed: ${errorMessage}`);
        }
    };


    return (
        <div className="addStore-container">
            <h1>Add Store</h1>
            <input
                type="text"
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="text"
                placeholder="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
            <input
                type="text"
                placeholder="store_manager"
                value={store_manager}
                onChange={(e) => setStore_Manager(e.target.value)}
            />
            <input
                type="number"
                placeholder="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <input
                type="text"
                placeholder="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            />
            <input
                type="number"
                placeholder="employee_count"
                value={employee_count}
                onChange={(e) => setEmployee_Count(e.target.value)}
            />
            <button onClick={handleAddStore}>Add Store</button>
        </div>


    );
};

export default AddStore;
