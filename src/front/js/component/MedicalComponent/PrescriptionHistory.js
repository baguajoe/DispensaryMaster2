import React from 'react';
// import '../../styles/medical/PrescriptionHistory.css';

const PrescriptionHistory = ({ patientId }) => {
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        // Fetch prescription history for the patient
        fetch(`/api/prescriptions/${patientId}`)
            .then((response) => response.json())
            .then((data) => setPrescriptions(data))
            .catch((error) => console.error('Error fetching prescription history:', error));
    }, [patientId]);

    if (!prescriptions.length) return <p>No prescriptions found.</p>;

    return (
        <div className="prescription-history">
            <h2>Prescription History</h2>
            <ul>
                {prescriptions.map((prescription) => (
                    <li key={prescription.id}>
                        <p><strong>Strain:</strong> {prescription.product_name}</p>
                        <p><strong>THC:</strong> {prescription.thc_content}%</p>
                        <p><strong>CBD:</strong> {prescription.cbd_content}%</p>
                        <p><strong>Dosage:</strong> {prescription.dosage}</p>
                        <p><strong>Prescribed Date:</strong> {new Date(prescription.prescribed_date).toLocaleDateString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PrescriptionHistory;