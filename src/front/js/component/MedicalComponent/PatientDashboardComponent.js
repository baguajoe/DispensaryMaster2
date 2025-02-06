import React from 'react';
import "../../../styles/medical/PatientDashboard.css"


const PatientDashboardComponent = () => {
    const patientData = {
        name: "John Doe",
        age: 45,
        email: "john.doe@example.com",
        phone: "555-1234",
        upcomingAppointments: [
            { date: "2025-02-10", time: "10:00 AM", dispensary: "GreenLeaf Dispensary" },
            { date: "2025-03-01", time: "2:30 PM", dispensary: "Herbal Wellness Center" }
        ],
        prescriptions: [
            { strain: "Blue Dream", dosage: "1g/day", purpose: "Chronic Pain Relief" },
            { strain: "Harlequin", dosage: "0.5g/day", purpose: "Anxiety Management" }
        ],
        targetedConditions: ["Chronic Pain", "Anxiety", "Insomnia"],
        loyaltyPoints: 250,
        recommendations: [
            { note: "Increase CBD dosage to 0.8g/day for anxiety relief.", date: "2025-01-25" },
            { note: "Consider rotating strains between Blue Dream and Northern Lights.", date: "2025-02-01" }
        ]
    };

    return (
        <div className="dashboard-container">
            <h1>Medical Cannabis Patient Dashboard</h1>

            {/* Patient Overview */}
            <h2>Patient Overview</h2>
            <div className="patient-info">
                <p><strong>Name:</strong> {patientData.name}</p>
                <p><strong>Age:</strong> {patientData.age}</p>
                <p><strong>Email:</strong> {patientData.email}</p>
                <p><strong>Phone:</strong> {patientData.phone}</p>
            </div>

            {/* Upcoming Appointments */}
            <h3>Upcoming Dispensary Visits</h3>
            {patientData.upcomingAppointments.map((appointment, index) => (
                <div className="appointment-card" key={index}>
                    <p><strong>Date:</strong> {appointment.date} - <strong>Time:</strong> {appointment.time}</p>
                    <p><strong>Dispensary:</strong> {appointment.dispensary}</p>
                </div>
            ))}

            {/* Current Prescriptions */}
            <h3>Current Prescriptions</h3>
            {patientData.prescriptions.map((medication, index) => (
                <p key={index}>
                    <strong>{medication.strain}</strong>: {medication.dosage} - <em>{medication.purpose}</em>
                </p>
            ))}

            {/* Targeted Conditions */}
            <h3>Targeted Conditions</h3>
            <ul>
                {patientData.targetedConditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                ))}
            </ul>

            {/* Recommendations */}
            <h3>Recommendations</h3>
            {patientData.recommendations.map((recommendation, index) => (
                <p key={index}><strong>Date:</strong> {recommendation.date} - {recommendation.note}</p>
            ))}

            {/* Loyalty Program */}
            <h3>Loyalty Points</h3>
            <p className="loyalty-points">{patientData.loyaltyPoints} points</p>
        </div>
    );
};

export default PatientDashboardComponent;
