import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BillingInsurance = () => {
    const [insurances, setInsurances] = useState([]);

    useEffect(() => {
        axios.get('/api/insurances')
            .then(response => setInsurances(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Billing and Insurance</h1>
            <ul>
                {insurances.map(insurance => (
                    <li key={insurance.id}>
                        {insurance.provider_name} - {insurance.policy_number}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BillingInsurance;
