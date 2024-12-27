import React, { useEffect, useState } from "react";

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    frequency: "",
  });

  const fetchPrescriptions = async () => {
    const response = await fetch(process.env.BACKEND_URL + "/api/prescriptions");
    const data = await response.json();
    setPrescriptions(data);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    fetchPrescriptions();
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Prescription Management</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        Add Prescription
      </button>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription) => (
            <tr key={prescription.id}>
              <td>{prescription.patientId}</td>
              <td>{prescription.medication}</td>
              <td>{prescription.dosage}</td>
              <td>{prescription.frequency}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal show d-block" role="dialog" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Prescription</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Patient ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.patientId}
                      onChange={(e) =>
                        setFormData({ ...formData, patientId: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Medication</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.medication}
                      onChange={(e) =>
                        setFormData({ ...formData, medication: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dosage</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Frequency</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManagement;




// import React, { useEffect, useState } from "react";
// import { Button, Table, Modal, Form } from "react-bootstrap";

// const PrescriptionManagement = () => {
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     patientId: "",
//     medication: "",
//     dosage: "",
//     frequency: "",
//   });

//   const fetchPrescriptions = async () => {
//     const response = await fetch("/api/prescriptions");
//     const data = await response.json();
//     setPrescriptions(data);
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     await fetch("/api/prescriptions", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });
//     setShowModal(false);
//     fetchPrescriptions();
//   };

//   useEffect(() => {
//     fetchPrescriptions();
//   }, []);

//   return (
//     <div>
//       <h2>Prescription Management</h2>
//       <Button onClick={() => setShowModal(true)}>Add Prescription</Button>
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Patient ID</th>
//             <th>Medication</th>
//             <th>Dosage</th>
//             <th>Frequency</th>
//           </tr>
//         </thead>
//         <tbody>
//           {prescriptions.map((prescription) => (
//             <tr key={prescription.id}>
//               <td>{prescription.patientId}</td>
//               <td>{prescription.medication}</td>
//               <td>{prescription.dosage}</td>
//               <td>{prescription.frequency}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add Prescription</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleFormSubmit}>
//             <Form.Group>
//               <Form.Label>Patient ID</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.patientId}
//                 onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Medication</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.medication}
//                 onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Dosage</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.dosage}
//                 onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Frequency</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.frequency}
//                 onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
//               />
//             </Form.Group>
//             <Button type="submit">Submit</Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default PrescriptionManagement;
