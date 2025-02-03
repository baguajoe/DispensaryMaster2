import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InsuranceDetailsComponent from '../../component/MedicalComponent/InsuranceDetailsComponent';
import BillingHistoryComponent from '../../component/MedicalComponent/BillingHistoryComponent';
import PaymentOptionsComponent from "../../component/MedicalComponent/PaymentOptionsComponent"

const BillingInsurance = () => {
    const [insurances, setInsurances] = useState([]);
    const [billingHistory, setBillingHistory] = useState([]);
    const [paymentOptions, setPaymentOptions] = useState(['Credit Card', 'Cash', 'Insurance']);

    useEffect(() => {
        // Fetch insurance providers
        axios.get('/api/insurances')
            .then(response => setInsurances(response.data))
            .catch(error => console.error('Error fetching insurances:', error));

        // Fetch billing history
        axios.get('/api/billing-history')
            .then(response => setBillingHistory(response.data))
            .catch(error => console.error('Error fetching billing history:', error));
    }, []);

    return (
        <div className="billing-insurance-container">
            <h1>Billing and Insurance</h1>

            {/* Insurance Details Section */}
            <InsuranceDetailsComponent insurances={insurances} />

            {/* Billing History Section */}
            <BillingHistoryComponent billingHistory={billingHistory} />

            {/* Payment Options Section */}
            <PaymentOptionsComponent options={paymentOptions} />
        </div>
    );
};

export default BillingInsurance;
