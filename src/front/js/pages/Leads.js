import React, { useState, useEffect } from "react";
import LeadForm from "../component/LeadForm";
import LeadTable from "../component/LeadTable";
import "../../styles/lead.css";

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [newLead, setNewLead] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        fetch(process.env.BACKEND_URL + "/api/leads", {
            headers: { Authorization: "Bearer " + sessionStorage.getItem("token") },
        })
            .then((response) => response.json())
            .then((data) => setLeads(data))
            .catch((error) => console.error("Error fetching leads:", error));
    }, []);

    const handleAddLead = async () => {
        const response = await fetch(process.env.BACKEND_URL + "/api/leads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            body: JSON.stringify(newLead),
        });

        if (response.ok) {
            const addedLead = await response.json();
            setLeads([...leads, addedLead]);
            setNewLead({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
            });
        } else {
            alert("Failed to add lead.");
        }
    };

    const handleDeleteLead = async (leadId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this lead?");
        if (!confirmDelete) return;

        const response = await fetch(`${process.env.BACKEND_URL}/api/leads/${leadId}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + sessionStorage.getItem("token") },
        });

        if (response.ok) {
            setLeads(leads.filter((lead) => lead.id !== leadId));
        } else {
            alert("Failed to delete lead.");
        }
    };

    return (
        <div className="p-6 main-content">
            <h1 className="text-2xl font-bold mb-4">Lead Management</h1>
            <LeadForm
                newLead={newLead}
                setNewLead={setNewLead}
                handleAddLead={handleAddLead}
            />
            <LeadTable leads={leads} handleDeleteLead={handleDeleteLead} />
        </div>
    );
};

export default Leads;
