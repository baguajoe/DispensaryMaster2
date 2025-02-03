import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ComplianceReportsComponent = () => {
    const [reports, setReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        // Fetch reports from the API
        axios.get('/api/compliance-reports')
            .then(response => setReports(response.data))
            .catch(error => console.error('Error fetching reports:', error));
    }, []);

    // Handle search input
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
        filterReports(e.target.value.toLowerCase(), statusFilter);
    };

    // Handle status filtering
    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        filterReports(searchQuery, e.target.value);
    };

    // Filter reports based on search and status
    const filterReports = (searchTerm, status) => {
        axios.get('/api/compliance-reports')
            .then(response => {
                const filtered = response.data.filter(report => {
                    const matchesSearch = report.name.toLowerCase().includes(searchTerm) ||
                                          report.type.toLowerCase().includes(searchTerm);
                    const matchesStatus = status === 'All' || report.status === status;
                    return matchesSearch && matchesStatus;
                });
                setReports(filtered);
            })
            .catch(error => console.error('Error filtering reports:', error));
    };

    // Export reports to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Compliance Reports', 14, 10);
        doc.autoTable({
            head: [['Report ID', 'Report Name', 'Report Type', 'Status', 'Date Created', 'Due Date']],
            body: reports.map(report => [
                report.id,
                report.name,
                report.type,
                report.status,
                new Date(report.date_created).toLocaleString(),
                new Date(report.due_date).toLocaleString()
            ])
        });
        doc.save('compliance_reports.pdf');
    };

    // Export reports to CSV
    const exportToCSV = () => {
        const csvRows = [
            ['Report ID', 'Report Name', 'Report Type', 'Status', 'Date Created', 'Due Date'],
            ...reports.map(report => [
                report.id,
                report.name,
                report.type,
                report.status,
                new Date(report.date_created).toLocaleString(),
                new Date(report.due_date).toLocaleString()
            ])
        ];
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'compliance_reports.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // View audit history (dummy implementation)
    const showAuditHistory = (report) => {
        const history = report.history || ['No audit history available'];
        alert(`Audit history for ${report.name}:\n\n${history.join('\n')}`);
    };

    return (
        <div className="compliance-reports-container">
            <h2>Compliance Reports</h2>

            {/* Search and Filter Controls */}
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by report name or type"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                <select value={statusFilter} onChange={handleStatusFilter}>
                    <option value="All">All</option>
                    <option value="Compliant">Compliant</option>
                    <option value="Violation">Violation</option>
                    <option value="Under Review">Under Review</option>
                </select>
            </div>

            {/* Export Buttons */}
            <div className="export-buttons">
                <button onClick={exportToPDF} className="export-btn">Export to PDF</button>
                <button onClick={exportToCSV} className="export-btn">Export to CSV</button>
            </div>

            {/* Reports Table */}
            <table className="compliance-reports-table">
                <thead>
                    <tr>
                        <th>Report ID</th>
                        <th>Report Name</th>
                        <th>Report Type</th>
                        <th>Status</th>
                        <th>Date Created</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.length > 0 ? (
                        reports.map(report => (
                            <tr key={report.id}>
                                <td>{report.id}</td>
                                <td>{report.name}</td>
                                <td>{report.type}</td>
                                <td>
                                    <span className={`status ${report.status.toLowerCase().replace(' ', '-')}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td>{new Date(report.date_created).toLocaleString()}</td>
                                <td>{new Date(report.due_date).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => showAuditHistory(report)}>View History</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-reports">No compliance reports found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ComplianceReportsComponent;
