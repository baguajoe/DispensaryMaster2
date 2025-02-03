import React, { useState } from 'react';

const PaymentOptionsComponent = ({ options }) => {
    const [selectedOption, setSelectedOption] = useState(options[0]);

    const handlePaymentSelection = (e) => {
        setSelectedOption(e.target.value);
    };

    const handlePayment = () => {
        alert(`You selected ${selectedOption} as your payment method.`);
    };

    return (
        <div className="payment-options">
            <h2>Payment Options</h2>
            <select value={selectedOption} onChange={handlePaymentSelection}>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <button onClick={handlePayment}>Proceed with Payment</button>
        </div>
    );
};

export default PaymentOptionsComponent;
