import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../../styles/medical/AppointmentManagement.css';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        axios.get('/api/appointments')
            .then(response => {
                setAppointments(response.data);
                setFilteredAppointments(response.data);
            })
            .catch(error => console.error(error));
    }, []);

    // Handle search input
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
        filterAppointments(e.target.value.toLowerCase(), statusFilter);
    };

    // Handle status filtering
    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        filterAppointments(searchQuery, e.target.value);
    };

    // Handle sorting by date
    const handleSort = () => {
        const sorted = [...filteredAppointments].sort((a, b) => {
            const dateA = new Date(a.appointment_date);
            const dateB = new Date(b.appointment_date);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setFilteredAppointments(sorted);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Filter appointments based on search and status
    const filterAppointments = (searchTerm, status) => {
        let filtered = appointments.filter(appointment => {
            const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm) ||
                                  appointment.appointment_type.toLowerCase().includes(searchTerm);

            const matchesStatus = status === 'All' || appointment.status === status;

            return matchesSearch && matchesStatus;
        });

        setFilteredAppointments(filtered);
    };

    // Export appointments to CSV
    const exportToCSV = () => {
        const csvRows = [
            ['Patient Name', 'Appointment Date', 'Doctor/Provider', 'Status', 'Appointment Type'],
            ...filteredAppointments.map(appointment => [
                appointment.patient_name,
                new Date(appointment.appointment_date).toLocaleString(),
                appointment.doctor,
                appointment.status,
                appointment.appointment_type
            ])
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'appointments.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export appointments to PDF using jsPDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Appointment Management', 14, 10);
        doc.autoTable({
            head: [['Patient Name', 'Appointment Date', 'Doctor/Provider', 'Status', 'Appointment Type']],
            body: filteredAppointments.map(appointment => [
                appointment.patient_name,
                new Date(appointment.appointment_date).toLocaleString(),
                appointment.doctor,
                appointment.status,
                appointment.appointment_type
            ])
        });
        doc.save('appointments.pdf');
    };

    // Show appointment history (dummy implementation)
    const showAppointmentHistory = (appointment) => {
        const history = appointment.history || ['No history available'];
        alert(`History of ${appointment.patient_name}:\n\n${history.join('\n')}`);
    };

    return (
        <div className="appointment-container">
            <h1>Appointment Management</h1>

            {/* Export Buttons */}
            <div className="export-buttons">
                <button onClick={exportToCSV} className="export-btn">Export to CSV</button>
                <button onClick={exportToPDF} className="export-btn">Export to PDF</button>
            </div>

            {/* Search and Filter Controls */}
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by patient or type"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <select value={statusFilter} onChange={handleStatusFilter}>
                    <option value="All">All</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                </select>
            </div>

            <table className="appointments-table">
                <thead>
                    <tr>
                        <th>Patient Name</th>
                        <th onClick={handleSort} style={{ cursor: 'pointer' }}>
                            Appointment Date {sortOrder === 'asc' ? '↑' : '↓'}
                        </th>
                        <th>Doctor/Provider</th>
                        <th>Status</th>
                        <th>Appointment Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appointment => (
                            <tr key={appointment.id}>
                                <td>{appointment.patient_name}</td>
                                <td>{new Date(appointment.appointment_date).toLocaleString()}</td>
                                <td>{appointment.doctor}</td>
                                <td>
                                    <span className={`status ${appointment.status.toLowerCase()}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td>{appointment.appointment_type}</td>
                                <td>
                                    <button onClick={() => handleReschedule(appointment.id)}>Reschedule</button>
                                    <button onClick={() => handleCancel(appointment.id)}>Cancel</button>
                                    <button onClick={() => showAppointmentHistory(appointment)}>View History</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="no-appointments">No appointments found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    function handleReschedule(id) {
        console.log(`Rescheduling appointment ${id}`);
        // Trigger reschedule logic
    }

    function handleCancel(id) {
        console.log(`Canceling appointment ${id}`);
        // Trigger cancel logic (e.g., API call)
    }
};

export default AppointmentManagement;
