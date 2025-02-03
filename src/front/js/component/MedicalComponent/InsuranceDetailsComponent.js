import React from 'react';

const InsuranceDetailsComponent = ({ insurances }) => {
    return (
        <div className="insurance-details">
            <h2>Insurance Providers</h2>
            <ul>
                {insurances.length > 0 ? (
                    insurances.map(insurance => (
                        <li key={insurance.id}>
                            <strong>{insurance.provider_name}</strong> - Policy Number: {insurance.policy_number}
                        </li>
                    ))
                ) : (
                    <p>No insurance providers available.</p>
                )}
            </ul>
        </div>
    );
};

export default InsuranceDetailsComponent;
