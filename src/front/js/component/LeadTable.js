import React from "react";
import PropTypes from "prop-types";

const LeadTable = ({ leads, handleDeleteLead }) => {
    return (
        <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2">First Name</th>
                    <th className="px-4 py-2">Last Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {leads.map((lead) => (
                    <tr key={lead.id} className="border-t">
                        <td className="px-4 py-2">{lead.first_name}</td>
                        <td className="px-4 py-2">{lead.last_name}</td>
                        <td className="px-4 py-2">{lead.email}</td>
                        <td className="px-4 py-2">{lead.phone}</td>
                        <td className="px-4 py-2">{lead.status}</td>
                        <td className="px-4 py-2">
                            <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

LeadTable.propTypes = {
    leads: PropTypes.arrayOf(PropTypes.object).isRequired,
    handleDeleteLead: PropTypes.func.isRequired,
};

export default LeadTable;
