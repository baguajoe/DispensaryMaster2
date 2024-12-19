import React from "react";
import PropTypes from "prop-types";

const LeadForm = ({ newLead, setNewLead, handleAddLead }) => {
    return (
        <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="First Name"
                    value={newLead.first_name}
                    onChange={(e) =>
                        setNewLead({ ...newLead, first_name: e.target.value })
                    }
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={newLead.last_name}
                    onChange={(e) =>
                        setNewLead({ ...newLead, last_name: e.target.value })
                    }
                    className="p-2 border rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newLead.email}
                    onChange={(e) =>
                        setNewLead({ ...newLead, email: e.target.value })
                    }
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Phone"
                    value={newLead.phone}
                    onChange={(e) =>
                        setNewLead({ ...newLead, phone: e.target.value })
                    }
                    className="p-2 border rounded"
                />
            </div>
            <button
                onClick={handleAddLead}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
            >
                Add Lead
            </button>
        </div>
    );
};

LeadForm.propTypes = {
    newLead: PropTypes.object.isRequired,
    setNewLead: PropTypes.func.isRequired,
    handleAddLead: PropTypes.func.isRequired,
};

export default LeadForm;
