import React, { useState } from 'react';

const PatientRegistrationComponent = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        medicalCardNumber: '',
        cardExpirationDate: '',
        primaryCondition: '',
        preferredCannabisProducts: '',
        consentToTreatment: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registered Patient:', formData);
        // Call an API or backend service to store the registration data
    };

    return (
        <div className="registration-form-container">
            <form onSubmit={handleSubmit} className="patient-registration-form">
                <label>
                    First Name:
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                    />
                </label>

                <label>
                    Last Name:
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                    />
                </label>

                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="johndoe@example.com"
                        required
                    />
                </label>

                <label>
                    Phone Number:
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 555-5555"
                        required
                    />
                </label>

                <label>
                    Date of Birth:
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Medical Card Number:
                    <input
                        type="text"
                        name="medicalCardNumber"
                        value={formData.medicalCardNumber}
                        onChange={handleChange}
                        placeholder="1234-5678-9101"
                        required
                    />
                </label>

                <label>
                    Card Expiration Date:
                    <input
                        type="date"
                        name="cardExpirationDate"
                        value={formData.cardExpirationDate}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Primary Condition (e.g., Pain, Anxiety, PTSD):
                    <input
                        type="text"
                        name="primaryCondition"
                        value={formData.primaryCondition}
                        onChange={handleChange}
                        placeholder="Chronic Pain"
                        required
                    />
                </label>

                <label>
                    Preferred Cannabis Products (Optional):
                    <input
                        type="text"
                        name="preferredCannabisProducts"
                        value={formData.preferredCannabisProducts}
                        onChange={handleChange}
                        placeholder="THC Oil, CBD Capsules"
                    />
                </label>

                <label className="consent-checkbox">
                    <input
                        type="checkbox"
                        name="consentToTreatment"
                        checked={formData.consentToTreatment}
                        onChange={handleChange}
                    />
                    I consent to receiving medical cannabis treatment.
                </label>

                <button type="submit" className="submit-button">
                    Register Patient
                </button>
            </form>
        </div>
    );
};

export default PatientRegistrationComponent;
