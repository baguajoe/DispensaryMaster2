import React from 'react';

const BillingHistoryComponent = ({ billingHistory }) => {
    return (
        <div className="billing-history">
            <h2>Billing History</h2>
            {billingHistory.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billingHistory.map((bill, index) => (
                            <tr key={index}>
                                <td>{new Date(bill.date).toLocaleDateString()}</td>
                                <td>{bill.description}</td>
                                <td>${bill.amount.toFixed(2)}</td>
                                <td>{bill.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No billing history available.</p>
            )}
        </div>
    );
};

export default BillingHistoryComponent;
