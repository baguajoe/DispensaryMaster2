import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        axios.get('/api/appointments')
            .then(response => setAppointments(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Appointment Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appointment => (
                        <tr key={appointment.id}>
                            <td>{appointment.patient_name}</td>
                            <td>{new Date(appointment.appointment_date).toLocaleString()}</td>
                            <td>{appointment.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AppointmentManagement;
